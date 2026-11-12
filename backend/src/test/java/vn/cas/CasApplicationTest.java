package vn.cas;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockStatic;

import java.util.TimeZone;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;

class CasApplicationTest {
    @Test
    void startsWithVietnamTimeZone() {
        TimeZone previous = TimeZone.getDefault();
        try (var spring = mockStatic(SpringApplication.class)) {
            TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
            CasApplication.main(new String[0]);
            assertThat(TimeZone.getDefault().getID()).isEqualTo("Asia/Ho_Chi_Minh");
            spring.verify(() -> SpringApplication.run(CasApplication.class, new String[0]));
        } finally {
            TimeZone.setDefault(previous);
        }
    }
}
