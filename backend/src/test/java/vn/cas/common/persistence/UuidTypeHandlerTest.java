package vn.cas.common.persistence;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.sql.PreparedStatement;
import java.util.UUID;
import org.apache.ibatis.type.JdbcType;
import org.junit.jupiter.api.Test;

class UuidTypeHandlerTest {

  private final UuidTypeHandler handler = new UuidTypeHandler();

  @Test
  void shouldPersistUuidAsItsCanonicalString() throws Exception {
    UUID requestId = UUID.randomUUID();
    PreparedStatement statement = mock(PreparedStatement.class);

    handler.setNonNullParameter(statement, 1, requestId, JdbcType.CHAR);

    verify(statement).setString(1, requestId.toString());
  }
}
