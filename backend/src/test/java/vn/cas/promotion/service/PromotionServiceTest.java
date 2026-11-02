package vn.cas.promotion.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.promotion.mapper.PromotionMapper;
import vn.cas.promotion.model.Promotion;
import vn.cas.promotion.model.PromotionCode;
import vn.cas.store.model.SalesSessionLookup;
import vn.cas.store.service.SalesSessionService;

class PromotionServiceTest {

    private final PromotionMapper mapper = mock(PromotionMapper.class);
    private final SalesSessionService sessions = mock(SalesSessionService.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final PromotionService service = new PromotionService(mapper, sessions, auditLogs);
    private final OperationalPrincipal principal = new OperationalPrincipal(1L, 2L, "firebase-uid",
            "Admin One", "ADMIN");

    @BeforeEach
    void noExistingCodeByDefault() {
        when(mapper.findCodePromotionId(org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.anyString())).thenReturn(null);
    }

    @Test
    void shouldRejectTargetsForWholeBillPromotion() {
        assertThatThrownBy(() -> service.create(principal, promotion("PERCENT_OFF", null),
                List.of(), List.of(new PromotionService.Target("CATEGORY", 3L)), UUID.randomUUID()))
                .isInstanceOf(ApiException.class);

        verify(mapper, never()).insert(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void shouldRejectZeroQuota() {
        var promotion = new Promotion(0, null, "Promotion", "PERCENT_OFF", BigDecimal.TEN, null,
                null, 0, null, "DRAFT", null, null);

        assertThatThrownBy(
                () -> service.create(principal, promotion, List.of(), List.of(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void identifiesDuplicateCodeInInput() {
        assertThatThrownBy(() -> service.create(principal, promotion("PERCENT_OFF", null),
                List.of(new PromotionService.Code("SAVE", null),
                        new PromotionService.Code("SAVE", 5)),
                List.of(), UUID.randomUUID())).isInstanceOf(ApiException.class)
                .hasMessageContaining("Mã SAVE");
        verify(mapper, never()).insert(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void identifiesCodeOwnedByAnotherPromotionBeforeCreating() {
        when(mapper.findCodePromotionId(2L, "RT42")).thenReturn(9L);
        assertThatThrownBy(() -> service.create(principal, promotion("PERCENT_OFF", null),
                List.of(new PromotionService.Code("NEW", null),
                        new PromotionService.Code("RT42", null)),
                List.of(), UUID.randomUUID())).isInstanceOf(ApiException.class)
                .hasMessageContaining("Mã RT42 đã tồn tại");
        verify(mapper, never()).insert(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.any());
    }

    @Test
    void identifiesCodeWhenConcurrentInsertConflicts() {
        when(mapper.lastInsertId()).thenReturn(1L);
        when(mapper.insertCode(2L, 1L, "RT42", null))
                .thenThrow(new org.springframework.dao.DuplicateKeyException("duplicate"));
        assertThatThrownBy(() -> service.create(principal, promotion("PERCENT_OFF", null),
                List.of(new PromotionService.Code("RT42", null)), List.of(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class).hasMessageContaining("Mã RT42 đã tồn tại");
    }

    @Test
    void updatesExistingCodeWithoutReplacingItsIdAndAllowsQuotaEqualToConsumed() {
        var current = promotion("PERCENT_OFF", 20);
        var updated = promotion("PERCENT_OFF", 5);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.findByPublicId(2L, "promotion-1")).thenReturn(updated);
        when(mapper.findCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.findAllCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.countConsumedRedemptions(1L)).thenReturn(5L);
        when(mapper.countConsumedRedemptionsByCode(7L)).thenReturn(4L);
        when(mapper.update(2L, 1L, updated)).thenReturn(1);

        service.update(principal, "promotion-1", updated,
                List.of(new PromotionService.Code("SAVE", 4)), List.of(), UUID.randomUUID());

        verify(mapper).restoreCode(1L, 7L, 4);
        verify(mapper, never()).deleteCodes(1L);
        verify(mapper, never()).insertCode(2L, 1L, "SAVE", 4);
    }

    @Test
    void rejectsTotalQuotaBelowConsumed() {
        var current = promotion("PERCENT_OFF", 20);
        var updated = promotion("PERCENT_OFF", 4);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.countConsumedRedemptions(1L)).thenReturn(5L);

        assertThatThrownBy(() -> service.update(principal, "promotion-1", updated, List.of(),
                List.of(), UUID.randomUUID())).isInstanceOf(ApiException.class)
                .hasMessageContaining("không thể nhỏ hơn số lượt");
        verify(mapper, never()).update(2L, 1L, updated);
    }

    @Test
    void rejectsCodeQuotaBelowConsumed() {
        var current = promotion("PERCENT_OFF", null);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.findCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.findAllCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.countConsumedRedemptionsByCode(7L)).thenReturn(4L);

        assertThatThrownBy(() -> service.update(principal, "promotion-1", current,
                List.of(new PromotionService.Code("SAVE", 3)), List.of(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class).hasMessageContaining("mã SAVE");
        verify(mapper, never()).restoreCode(1L, 7L, 3);
    }

    @Test
    void rejectsFailedSoftDeletion() {
        var current = promotion("PERCENT_OFF", null);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.findCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.update(2L, 1L, current)).thenReturn(1);

        assertThatThrownBy(() -> service.update(principal, "promotion-1", current, List.of(),
                List.of(), UUID.randomUUID())).isInstanceOf(ApiException.class)
                .hasMessageContaining("mã SAVE");
        verify(mapper).softDeleteCode(1L, 7L);
    }

    @Test
    void softDeletesAnOmittedCode() {
        var current = promotion("PERCENT_OFF", null);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.findByPublicId(2L, "promotion-1")).thenReturn(current);
        when(mapper.findCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.softDeleteCode(1L, 7L)).thenReturn(1);
        when(mapper.update(2L, 1L, current)).thenReturn(1);

        service.update(principal, "promotion-1", current, List.of(), List.of(), UUID.randomUUID());

        verify(mapper).softDeleteCode(1L, 7L);
        verify(mapper, never()).deleteCodes(1L);
    }

    @Test
    void restoresPreviouslyDeletedCodeWithoutCreatingAnotherRecord() {
        var current = promotion("PERCENT_OFF", null);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.findByPublicId(2L, "promotion-1")).thenReturn(current);
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.findAllCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.update(2L, 1L, current)).thenReturn(1);

        service.update(principal, "promotion-1", current,
                List.of(new PromotionService.Code("SAVE", 5)), List.of(), UUID.randomUUID());

        verify(mapper).restoreCode(1L, 7L, 5);
        verify(mapper, never()).insertCode(2L, 1L, "SAVE", 5);
    }

    @Test
    void rejectsRestoringCodeWithQuotaBelowItsHistoricalUsage() {
        var current = promotion("PERCENT_OFF", null);
        when(mapper.findByPublicIdForUpdate(2L, "promotion-1")).thenReturn(current);
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.findAllCodes(1L)).thenReturn(List.of(new PromotionCode(7L, 1L, "SAVE", 10)));
        when(mapper.countConsumedRedemptionsByCode(7L)).thenReturn(4L);

        assertThatThrownBy(() -> service.update(principal, "promotion-1", current,
                List.of(new PromotionService.Code("SAVE", 3)), List.of(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class).hasMessageContaining("mã SAVE");
        verify(mapper, never()).restoreCode(1L, 7L, 3);
    }

    @Test
    void promotionWithOnlyDeletedCodesDoesNotBecomePublicOrEligible() {
        var session = new SalesSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1", "OPEN");
        var promotion = promotion("PERCENT_OFF", null);
        when(sessions.requireCurrent("session-1")).thenReturn(session);
        when(mapper.findByStoreId(2L)).thenReturn(List.of(promotion));
        when(mapper.currentPayableAmount(10L)).thenReturn(BigDecimal.valueOf(100_000));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.hasAnyCodes(1L)).thenReturn(true);

        assertThat(service.customerPromotions("session-1")).isEmpty();
        assertThat(service.eligible("session-1", "SAVE")).isEmpty();
        assertThat(service.eligible("session-1")).isEmpty();
    }

    @Test
    void shouldRejectMaximumDiscountForFixedAmountPromotion() {
        var promotion = new Promotion(0, null, "Promotion", "FIXED_AMOUNT_OFF", BigDecimal.TEN,
                BigDecimal.valueOf(50_000), null, null, null, "DRAFT", null, null);

        assertThatThrownBy(
                () -> service.create(principal, promotion, List.of(), List.of(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void shouldExcludePromotionWhenItsQuotaIsReached() {
        var session = new SalesSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1", "OPEN");
        var promotion = promotion("PERCENT_OFF", 1);
        when(sessions.requireCurrent("session-1")).thenReturn(session);
        when(mapper.findByStoreId(2L)).thenReturn(List.of(promotion));
        when(mapper.currentPayableAmount(10L)).thenReturn(BigDecimal.valueOf(100_000));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.countConsumedRedemptions(1L)).thenReturn(1L);

        assertThat(service.eligible("session-1")).isEmpty();
    }

    @Test
    void shouldReturnCompletedAndForfeitedRedemptionsForAdminUsageCount() {
        var promotion = promotion("PERCENT_OFF", 1);
        when(mapper.findByStoreId(2L)).thenReturn(List.of(promotion));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.findTargets(1L)).thenReturn(List.of());
        when(mapper.countUsedRedemptions(1L)).thenReturn(1L);

        var result = service.list(principal);

        assertThat(result).singleElement()
                .extracting(PromotionService.AdminPromotion::completedRedemptionCount)
                .isEqualTo(1L);
        verify(mapper).countUsedRedemptions(1L);
    }

    @Test
    void shouldLockPromotionWhileSelectingItForPayment() {
        var session = new SalesSessionLookup(10L, 20L, 2L, 5L, 9L, 1L, null, "session-1", "OPEN");
        var promotion = promotion("PERCENT_OFF", 1);
        when(mapper.findByIdForUpdate(2L, 1L)).thenReturn(promotion);
        when(mapper.currentPayableAmount(10L)).thenReturn(BigDecimal.valueOf(100_000));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.countConsumedRedemptions(1L)).thenReturn(0L);

        assertThat(service.selectedForPayment(session)).isNotNull();

        verify(mapper).findByIdForUpdate(2L, 1L);
    }

    @Test
    void shouldReturnActivePromotionAsUnavailableWhenMinimumBillIsNotMet() {
        var session = new SalesSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1", "OPEN");
        var promotion = new Promotion(1L, "promotion-1", "Giảm giá", "PERCENT_OFF", BigDecimal.TEN,
                null, BigDecimal.valueOf(100_000), null, null, "ACTIVE", null, null);
        when(sessions.requireCurrent("session-1")).thenReturn(session);
        when(mapper.findByStoreId(2L)).thenReturn(List.of(promotion));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.currentPayableAmount(10L)).thenReturn(BigDecimal.valueOf(50_000));

        var result = service.customerPromotions("session-1");

        assertThat(result).singleElement().satisfies(value -> {
            assertThat(value.eligible()).isFalse();
            assertThat(value.unavailableReason()).isEqualTo("Chưa đạt giá trị đơn hàng tối thiểu.");
        });
    }

    @Test
    void shouldReturnEveryPromotionTargetNameInScope() {
        var session = new SalesSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1", "OPEN");
        var promotion = promotion("ITEM_PERCENT_OFF", null);
        when(sessions.requireCurrent("session-1")).thenReturn(session);
        when(mapper.findByStoreId(2L)).thenReturn(List.of(promotion));
        when(mapper.currentPayableAmount(10L)).thenReturn(BigDecimal.valueOf(100_000));
        when(mapper.targetedPayableAmount(10L, 1L)).thenReturn(BigDecimal.valueOf(50_000));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.findTargetNames(1L)).thenReturn(
                List.of(new PromotionMapper.PromotionTargetName("MENU_ITEM", "Khoai tây chiên"),
                        new PromotionMapper.PromotionTargetName("CATEGORY", "Đồ giải khát")));

        var result = service.eligible("session-1");

        assertThat(result).singleElement().extracting(PromotionService.Eligible::scope)
                .isEqualTo("Áp dụng cho Khoai tây chiên, danh mục Đồ giải khát");
    }

    private static Promotion promotion(String type, Integer maxRedemptions) {
        return new Promotion(1L, "promotion-1", "Promotion", type, BigDecimal.TEN, null, null,
                maxRedemptions, null, "ACTIVE", null, null);
    }
}
