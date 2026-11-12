package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.AdminLookupMapper;
import vn.cas.operation.model.CustomerSort;

class AdminLookupServiceTest {
    private final AdminLookupMapper mapper = mock(AdminLookupMapper.class);
    private final AdminLookupService service = new AdminLookupService(mapper);
    private final OperationalPrincipal admin = new OperationalPrincipal(1, 2, "uid", "Admin",
            "ADMIN");

    @Test
    void filtersInclusiveDatesAndPaginatesWithoutOverflow() {
        var from = LocalDate.of(2026, 10, 1);
        var to = LocalDate.of(2026, 10, 31);
        service.customers(admin, " An ", from, to, CustomerSort.AMOUNT_DESC, 2, 10);
        verify(mapper).findCustomers(2, "An", from.atStartOfDay(), to.plusDays(1).atStartOfDay(),
                "AMOUNT_DESC", 10, 20L);
        verify(mapper).countCustomers(2, "An", from.atStartOfDay(), to.plusDays(1).atStartOfDay());
    }

    @Test
    void rejectsPartialOrInvertedDateRanges() {
        var day = LocalDate.of(2026, 10, 1);
        assertThatThrownBy(
                () -> service.customers(admin, null, day, null, CustomerSort.RECENT, 0, 10))
                .isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.customers(admin, null, day.plusDays(1), day,
                CustomerSort.RECENT, 0, 10)).isInstanceOf(ApiException.class);
        verifyNoInteractions(mapper);
    }
}
