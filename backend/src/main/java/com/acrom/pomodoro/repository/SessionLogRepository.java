package com.acrom.pomodoro.repository;

import com.acrom.pomodoro.model.SessionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface SessionLogRepository extends JpaRepository<SessionLog, Long> {
    List<SessionLog> findTop10ByOrderByFinishedAtDesc();
    List<SessionLog> findByFinishedAtGreaterThanEqual(LocalDateTime from);
    long countByType(SessionLog.Type type);
}
