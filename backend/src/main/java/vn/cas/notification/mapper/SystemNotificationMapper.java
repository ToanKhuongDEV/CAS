package vn.cas.notification.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.notification.dto.CreateSystemNotificationCommand;
import vn.cas.notification.model.RecipientNotification;
import vn.cas.notification.model.SystemNotification;

@Mapper
public interface SystemNotificationMapper {
    int insert(CreateSystemNotificationCommand command);
    int insertRecipientsForActiveOperators(@Param("notificationId") long notificationId,
            @Param("storeId") long storeId);
    int insertRecipientsForActiveCustomerSessions(@Param("notificationId") long notificationId,
            @Param("storeId") long storeId);
    List<SystemNotification> findByStoreId(@Param("storeId") long storeId);
    List<RecipientNotification> findByAccountId(@Param("accountId") long accountId);
    List<RecipientNotification> findByTableSessionId(@Param("tableSessionId") long tableSessionId);
    long countUnreadByAccountId(@Param("accountId") long accountId);
    long countUnreadByTableSessionId(@Param("tableSessionId") long tableSessionId);
    boolean existsForAccount(@Param("notificationId") long notificationId,
            @Param("accountId") long accountId);
    boolean existsForTableSession(@Param("notificationId") long notificationId,
            @Param("tableSessionId") long tableSessionId);
    int markReadForAccount(@Param("notificationId") long notificationId,
            @Param("accountId") long accountId, @Param("readAt") LocalDateTime readAt);
    int markReadForTableSession(@Param("notificationId") long notificationId,
            @Param("tableSessionId") long tableSessionId, @Param("readAt") LocalDateTime readAt);
    int markAllReadForAccount(@Param("accountId") long accountId,
            @Param("readAt") LocalDateTime readAt);
    int markAllReadForTableSession(@Param("tableSessionId") long tableSessionId,
            @Param("readAt") LocalDateTime readAt);
    int deleteByStoreIdAndId(@Param("storeId") long storeId,
            @Param("notificationId") long notificationId);
}
