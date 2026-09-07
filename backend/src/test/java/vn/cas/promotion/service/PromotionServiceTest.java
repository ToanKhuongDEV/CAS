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
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.promotion.mapper.PromotionMapper;
import vn.cas.promotion.model.Promotion;
import vn.cas.store.model.CustomerTableSessionLookup;
import vn.cas.store.service.CustomerTableSessionService;

class PromotionServiceTest {

    private final PromotionMapper mapper = mock(PromotionMapper.class);
    private final CustomerTableSessionService sessions = mock(CustomerTableSessionService.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final PromotionService service = new PromotionService(mapper, sessions, auditLogs);
    private final OperationalPrincipal principal = new OperationalPrincipal(1L, 2L, "firebase-uid",
            "Admin One", "ADMIN");

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
    void shouldRejectMaximumDiscountForFixedAmountPromotion() {
        var promotion = new Promotion(0, null, "Promotion", "FIXED_AMOUNT_OFF", BigDecimal.TEN,
                BigDecimal.valueOf(50_000), null, null, null, "DRAFT", null, null);

        assertThatThrownBy(
                () -> service.create(principal, promotion, List.of(), List.of(), UUID.randomUUID()))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void shouldExcludePromotionWhenItsQuotaIsReached() {
        var session = new CustomerTableSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1",
                "OPEN");
        var promotion = promotion("PERCENT_OFF", 1);
        when(sessions.requireCurrent("session-1")).thenReturn(session);
        when(mapper.findByStoreId(2L)).thenReturn(List.of(promotion));
        when(mapper.currentPayableAmount(10L)).thenReturn(BigDecimal.valueOf(100_000));
        when(mapper.findCodes(1L)).thenReturn(List.of());
        when(mapper.countCompletedRedemptions(1L)).thenReturn(1L);

        assertThat(service.eligible("session-1")).isEmpty();
    }

    @Test
    void shouldReturnActivePromotionAsUnavailableWhenMinimumBillIsNotMet() {
        var session = new CustomerTableSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1",
                "OPEN");
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
        var session = new CustomerTableSessionLookup(10L, 20L, 2L, 5L, 9L, null, null, "session-1",
                "OPEN");
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
