package vn.cas.promotion.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.promotion.mapper.PromotionMapper;
import vn.cas.promotion.model.Promotion;
import vn.cas.promotion.model.PromotionCode;
import vn.cas.promotion.model.PromotionTarget;
import vn.cas.store.model.CustomerTableSessionLookup;
import vn.cas.store.service.CustomerTableSessionService;

@Service
public class PromotionService {
    private static final Logger log = LoggerFactory.getLogger(PromotionService.class);
    private final PromotionMapper mapper;
    private final CustomerTableSessionService sessions;
    private final AuditLogService auditLogs;

    public PromotionService(PromotionMapper mapper, CustomerTableSessionService sessions,
            AuditLogService auditLogs) {
        this.mapper = mapper;
        this.sessions = sessions;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public List<AdminPromotion> list(OperationalPrincipal principal) {
        return mapper.findByStoreId(principal.storeId()).stream().map(this::details).toList();
    }

    @Transactional(readOnly = true)
    public AdminPromotion get(OperationalPrincipal principal, String publicId) {
        return details(require(principal.storeId(), publicId));
    }

    @Transactional(readOnly = true)
    public RedemptionPage redemptions(OperationalPrincipal principal, String publicId, int page,
            int size) {
        var promotion = require(principal.storeId(), publicId);
        int offset = Math.multiplyExact(page, size);
        return new RedemptionPage(mapper.findRedemptions(promotion.id(), size, offset),
                mapper.countRedemptions(promotion.id()), page, size);
    }

    @Transactional
    public AdminPromotion create(OperationalPrincipal principal, Promotion promotion,
            List<Code> codes, List<Target> targets, UUID requestId) {
        validate(principal.storeId(), promotion, codes, targets);
        String publicId = UUID.randomUUID().toString();
        mapper.insert(publicId, principal.storeId(), promotion);
        long id = mapper.lastInsertId();
        links(principal.storeId(), id, codes, targets);
        audit(principal, requestId, "PROMOTION_CREATED", id, promotion.name());
        return details(require(principal.storeId(), publicId));
    }

    @Transactional
    public AdminPromotion update(OperationalPrincipal principal, String publicId,
            Promotion promotion, List<Code> codes, List<Target> targets, UUID requestId) {
        var existing = require(principal.storeId(), publicId);
        validate(principal.storeId(), promotion, codes, targets);
        if (mapper.update(principal.storeId(), existing.id(), promotion) != 1)
            throw notFound();
        mapper.deleteCodes(existing.id());
        mapper.deleteTargets(existing.id());
        links(principal.storeId(), existing.id(), codes, targets);
        audit(principal, requestId, "PROMOTION_UPDATED", existing.id(), existing.name());
        return details(require(principal.storeId(), publicId));
    }

    @Transactional
    public AdminPromotion updateStatus(OperationalPrincipal principal, String publicId,
            String status, UUID requestId) {
        var promotion = require(principal.storeId(), publicId);
        if (!List.of("DRAFT", "ACTIVE", "INACTIVE").contains(status))
            throw invalid();
        mapper.updateStatus(principal.storeId(), promotion.id(), status);
        audit(principal, requestId, "PROMOTION_STATUS_UPDATED", promotion.id(), promotion.name());
        return details(require(principal.storeId(), publicId));
    }

    @Transactional(readOnly = true)
    public List<Eligible> eligible(String sessionPublicId) {
        return eligible(sessionPublicId, null);
    }

    @Transactional(readOnly = true)
    public List<Eligible> eligible(String sessionPublicId, String code) {
        var session = sessions.requireCurrent(sessionPublicId);
        return mapper.findByStoreId(session.storeId()).stream()
                .map(promotion -> eligible(session, promotion, code))
                .flatMap(java.util.Optional::stream).toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerPromotion> customerPromotions(String sessionPublicId) {
        var session = sessions.requireCurrent(sessionPublicId);
        return mapper.findByStoreId(session.storeId()).stream()
                .filter(promotion -> "ACTIVE".equals(promotion.status()))
                .filter(promotion -> mapper.findCodes(promotion.id()).isEmpty())
                .map(promotion -> customerPromotion(session, promotion)).toList();
    }

    @Transactional(readOnly = true)
    public List<Eligible> eligibleForOperator(OperationalPrincipal principal,
            String sessionPublicId) {
        var session = sessions.requireCurrent(sessionPublicId);
        if (session.storeId() != principal.storeId())
            throw new ApiException(HttpStatus.FORBIDDEN, "Không có quyền truy cập phiên bàn.");
        return mapper.findByStoreId(session.storeId()).stream()
                .map(promotion -> eligible(session, promotion, null))
                .flatMap(java.util.Optional::stream).toList();
    }

    @Transactional
    public Eligible select(String sessionPublicId, String promotionId, String code) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        if (!"OPEN".equals(session.sessionStatus()))
            throw invalid();
        var promotion = require(session.storeId(), promotionId);
        var selected = eligible(session, promotion, code).orElseThrow(this::invalid);
        mapper.setSelection(session.sessionId(), promotion.id(), selected.codeId());
        return selected;
    }

    @Transactional
    public Eligible selectForOperator(OperationalPrincipal principal, String sessionPublicId,
            String promotionId, String code) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        if (session.storeId() != principal.storeId())
            throw new ApiException(HttpStatus.FORBIDDEN, "Không có quyền truy cập phiên bàn.");
        if (!"OPEN".equals(session.sessionStatus()))
            throw invalid();
        var promotion = require(session.storeId(), promotionId);
        var selected = eligible(session, promotion, code).orElseThrow(this::invalid);
        mapper.setSelection(session.sessionId(), promotion.id(), selected.codeId());
        return selected;
    }

    @Transactional
    public void clear(String sessionPublicId) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        if (mapper.clearSelection(session.sessionId()) != 1)
            throw invalid();
    }

    @Transactional
    public void clearForOperator(OperationalPrincipal principal, String sessionPublicId) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        if (session.storeId() != principal.storeId())
            throw new ApiException(HttpStatus.FORBIDDEN, "Không có quyền truy cập phiên bàn.");
        if (mapper.clearSelection(session.sessionId()) != 1)
            throw invalid();
    }

    @Transactional(readOnly = true)
    public Eligible selected(CustomerTableSessionLookup session) {
        if (session.selectedPromotionId() == null)
            return null;
        var promotion = mapper.findById(session.storeId(), session.selectedPromotionId());
        if (promotion == null)
            return null;
        String code = null;
        if (session.selectedPromotionCodeId() != null) {
            var value = mapper.findCode(promotion.id(), session.selectedPromotionCodeId());
            if (value == null)
                return null;
            code = value.code();
        }
        return eligible(session, promotion, code).orElse(null);
    }

    public void snapshot(CustomerTableSessionLookup session, long paymentId, Eligible discount,
            String snapshot) {
        if (discount == null)
            return;
        var promotion = require(session.storeId(), discount.promotionId());
        mapper.insertBillDiscount(session.storeId(), session.sessionId(), paymentId, promotion,
                discount.codeId(), discount.code(), discount.discountAmount(), snapshot);
    }

    public void redeem(long paymentId) {
        if (mapper.insertRedemptionFromDiscount(paymentId) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Khuyến mãi đã hết lượt sử dụng.");
    }

    private java.util.Optional<Eligible> eligible(CustomerTableSessionLookup session,
            Promotion promotion, String requestedCode) {
        BigDecimal bill = mapper.currentPayableAmount(session.sessionId());
        BigDecimal target = promotion.promotionType().startsWith("ITEM_")
                ? mapper.targetedPayableAmount(session.sessionId(), promotion.id())
                : bill;
        return eligible(promotion, requestedCode, bill, target, session.clientAccountId());
    }

    private CustomerPromotion customerPromotion(CustomerTableSessionLookup session,
            Promotion promotion) {
        BigDecimal bill = mapper.currentPayableAmount(session.sessionId());
        BigDecimal target = promotion.promotionType().startsWith("ITEM_")
                ? mapper.targetedPayableAmount(session.sessionId(), promotion.id())
                : bill;
        String unavailableReason = unavailableReason(promotion, bill, target,
                session.clientAccountId());
        BigDecimal amount = discount(promotion, bill, target);
        return new CustomerPromotion(promotion.publicId(), promotion.name(),
                promotion.promotionType(), promotion.discountValue(), promotion.maxDiscountAmount(),
                promotion.minBillAmount(), scope(promotion.id()), amount, bill.subtract(amount),
                unavailableReason == null, unavailableReason);
    }

    private java.util.Optional<Eligible> eligible(Promotion promotion, String requestedCode,
            BigDecimal bill, BigDecimal target, Long clientAccountId) {
        if (!"ACTIVE".equals(promotion.status())) {
            log.debug("Promotion {} excluded: status={}", promotion.publicId(), promotion.status());
            return java.util.Optional.empty();
        }
        if (!inPeriod(promotion)) {
            log.debug("Promotion {} excluded: outside period startAt={}, endAt={}",
                    promotion.publicId(), promotion.startAt(), promotion.endAt());
            return java.util.Optional.empty();
        }
        if (promotion.minBillAmount() != null && bill.compareTo(promotion.minBillAmount()) < 0) {
            log.debug("Promotion {} excluded: bill={} below minBillAmount={}", promotion.publicId(),
                    bill, promotion.minBillAmount());
            return java.util.Optional.empty();
        }
        List<PromotionCode> codes = mapper.findCodes(promotion.id());
        PromotionCode code = null;
        if (!codes.isEmpty()) {
            if (requestedCode == null || requestedCode.isBlank()) {
                log.debug("Promotion {} excluded: a code is required", promotion.publicId());
                return java.util.Optional.empty();
            }
            code = codes.stream()
                    .filter(value -> value.code().equalsIgnoreCase(requestedCode.trim()))
                    .findFirst().orElse(null);
            if (code == null) {
                log.debug("Promotion {} excluded: code does not match", promotion.publicId());
                return java.util.Optional.empty();
            }
        }
        if (promotion.maxRedemptions() != null
                && mapper.countCompletedRedemptions(promotion.id()) >= promotion.maxRedemptions()) {
            log.debug("Promotion {} excluded: promotion quota reached", promotion.publicId());
            return java.util.Optional.empty();
        }
        if (code != null && code.maxRedemptions() != null
                && mapper.countCompletedRedemptionsByCode(code.id()) >= code.maxRedemptions()) {
            log.debug("Promotion {} excluded: code quota reached", promotion.publicId());
            return java.util.Optional.empty();
        }
        if (promotion.maxRedemptionsPerCustomer() != null && (clientAccountId == null
                || mapper.countCompletedRedemptionsByPromotionAndCustomer(promotion.id(),
                        clientAccountId) >= promotion.maxRedemptionsPerCustomer())) {
            log.debug("Promotion {} excluded: customer quota reached", promotion.publicId());
            return java.util.Optional.empty();
        }
        BigDecimal amount = discount(promotion, bill, target);
        if (amount.signum() <= 0) {
            log.debug("Promotion {} excluded: discount is zero; bill={}, targetedAmount={}",
                    promotion.publicId(), bill, target);
            return java.util.Optional.empty();
        }
        log.debug("Promotion {} eligible: bill={}, discount={}, payable={}", promotion.publicId(),
                bill, amount, bill.subtract(amount));
        return java.util.Optional.of(new Eligible(promotion.publicId(), promotion.name(),
                promotion.promotionType(), code == null ? null : code.id(),
                code == null ? null : code.code(), promotion.discountValue(),
                promotion.maxDiscountAmount(), promotion.minBillAmount(), scope(promotion.id()),
                amount, bill.subtract(amount)));
    }

    private String unavailableReason(Promotion promotion, BigDecimal bill, BigDecimal target,
            Long clientAccountId) {
        if (!inPeriod(promotion))
            return "Khuyến mãi chưa hoặc đã hết thời gian áp dụng.";
        if (promotion.minBillAmount() != null && bill.compareTo(promotion.minBillAmount()) < 0)
            return "Chưa đạt giá trị đơn hàng tối thiểu.";
        if (target.signum() <= 0)
            return "Đơn hàng chưa có món thuộc phạm vi áp dụng.";
        if (promotion.maxRedemptions() != null
                && mapper.countCompletedRedemptions(promotion.id()) >= promotion.maxRedemptions())
            return "Khuyến mãi đã hết lượt sử dụng.";
        if (promotion.maxRedemptionsPerCustomer() != null && (clientAccountId == null
                || mapper.countCompletedRedemptionsByPromotionAndCustomer(promotion.id(),
                        clientAccountId) >= promotion.maxRedemptionsPerCustomer()))
            return "Bạn đã dùng hết lượt của khuyến mãi này.";
        return null;
    }

    private String scope(long promotionId) {
        var targets = mapper.findTargetNames(promotionId);
        if (targets.isEmpty())
            return "Áp dụng cho toàn bộ hóa đơn";
        return "Áp dụng cho " + targets.stream()
                .map(target -> "CATEGORY".equals(target.targetType())
                        ? "danh mục " + target.targetName()
                        : target.targetName())
                .collect(java.util.stream.Collectors.joining(", "));
    }

    private static BigDecimal discount(Promotion promotion, BigDecimal bill, BigDecimal base) {
        BigDecimal amount;
        if ("PERCENT_OFF".equals(promotion.promotionType())
                || "ITEM_PERCENT_OFF".equals(promotion.promotionType()))
            amount = base.multiply(promotion.discountValue()).divide(BigDecimal.valueOf(100), 0,
                    RoundingMode.HALF_UP);
        else if ("FIXED_AMOUNT_OFF".equals(promotion.promotionType())
                || "ITEM_FIXED_OFF".equals(promotion.promotionType()))
            amount = promotion.discountValue();
        else
            return BigDecimal.ZERO;
        if (promotion.promotionType().contains("PERCENT") && promotion.maxDiscountAmount() != null)
            amount = amount.min(promotion.maxDiscountAmount());
        return amount.min(base).min(bill).max(BigDecimal.ZERO);
    }

    private void validate(long storeId, Promotion promotion, List<Code> codes,
            List<Target> targets) {
        if (!List.of("PERCENT_OFF", "FIXED_AMOUNT_OFF", "ITEM_PERCENT_OFF", "ITEM_FIXED_OFF")
                .contains(promotion.promotionType()) || promotion.discountValue() == null
                || promotion.discountValue().signum() <= 0
                || (promotion.promotionType().contains("PERCENT")
                        && promotion.discountValue().compareTo(BigDecimal.valueOf(100)) > 0)
                || promotion.endAt() != null && promotion.startAt() != null
                        && promotion.endAt().isBefore(promotion.startAt()))
            throw invalid();
        if (promotion.maxDiscountAmount() != null && promotion.maxDiscountAmount().signum() < 0
                || promotion.maxDiscountAmount() != null
                        && !promotion.promotionType().contains("PERCENT")
                || promotion.minBillAmount() != null && promotion.minBillAmount().signum() < 0
                || promotion.maxRedemptions() != null && promotion.maxRedemptions() <= 0
                || promotion.maxRedemptionsPerCustomer() != null
                        && promotion.maxRedemptionsPerCustomer() <= 0
                || codes.stream().anyMatch(
                        code -> code.maxRedemptions() != null && code.maxRedemptions() <= 0))
            throw invalid();
        if (promotion.promotionType().startsWith("ITEM_") && targets.isEmpty()
                || !promotion.promotionType().startsWith("ITEM_") && !targets.isEmpty())
            throw invalid();
        for (Target target : targets)
            if (!("MENU_ITEM".equals(target.type()) && mapper.existsMenuItem(storeId, target.id())
                    || "CATEGORY".equals(target.type())
                            && mapper.existsCategory(storeId, target.id())))
                throw invalid();
    }

    private void links(long storeId, long promotionId, List<Code> codes, List<Target> targets) {
        for (Code code : codes)
            mapper.insertCode(storeId, promotionId, code.value().trim(), code.maxRedemptions());
        for (Target target : targets)
            mapper.insertTarget(storeId, promotionId, target.type(), target.id());
    }

    private Promotion require(long storeId, String publicId) {
        var promotion = mapper.findByPublicId(storeId, publicId);
        if (promotion == null)
            throw notFound();
        return promotion;
    }

    private AdminPromotion details(Promotion promotion) {
        return new AdminPromotion(promotion, mapper.findCodes(promotion.id()),
                mapper.findTargets(promotion.id()),
                mapper.countCompletedRedemptions(promotion.id()));
    }

    private static boolean inPeriod(Promotion promotion) {
        LocalDateTime now = LocalDateTime.now();
        return (promotion.startAt() == null || !now.isBefore(promotion.startAt()))
                && (promotion.endAt() == null || !now.isAfter(promotion.endAt()));
    }

    private void audit(OperationalPrincipal principal, UUID requestId, String action, long id,
            String name) {
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId, action, "PROMOTION",
                id, name, "{}", principal.accountId(), principal.displayName(), action));
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy khuyến mãi.");
    }
    private ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "Khuyến mãi không hợp lệ.");
    }
    public record Code(String value, Integer maxRedemptions) {
    }
    public record Target(String type, long id) {
    }
    public record AdminPromotion(Promotion promotion, List<PromotionCode> codes,
            List<PromotionTarget> targets, long completedRedemptionCount) {
    }
    public record RedemptionPage(List<PromotionMapper.PromotionRedemptionView> items, long total,
            int page, int size) {
    }
    public record Eligible(String promotionId, String name, String promotionType, Long codeId,
            String code, BigDecimal discountValue, BigDecimal maxDiscountAmount,
            BigDecimal minBillAmount, String scope, BigDecimal discountAmount,
            BigDecimal payableAmount) {
    }
    public record CustomerPromotion(String promotionId, String name, String promotionType,
            BigDecimal discountValue, BigDecimal maxDiscountAmount, BigDecimal minBillAmount,
            String scope, BigDecimal discountAmount, BigDecimal payableAmount, boolean eligible,
            String unavailableReason) {
    }
}
