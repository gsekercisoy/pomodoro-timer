package com.acrom.pomodoro.controller;

import com.acrom.pomodoro.model.SessionLog;
import com.acrom.pomodoro.repository.SessionLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SessionController {

    private final SessionLogRepository repo;

    public SessionController(SessionLogRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionLog log(@RequestBody SessionLog body) {
        if (body.type == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type WORK veya BREAK olmali");
        }
        if (body.minutes < 1 || body.minutes > 180) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minutes 1-180 araliginda olmali");
        }
        body.id = null;
        body.startedAt = LocalDateTime.now().minusMinutes(body.minutes);
        body.finishedAt = LocalDateTime.now();
        return repo.save(body);
    }

    @GetMapping("/sessions/recent")
    public java.util.List<SessionLog> recent() {
        return repo.findTop10ByOrderByFinishedAtDesc();
    }

    @GetMapping("/sessions/today")
    public Map<String, Object> today() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        java.util.List<SessionLog> list = repo.findByFinishedAtGreaterThanEqual(startOfToday);

        Map<String, Object> out = new LinkedHashMap<>();
        java.util.List<SessionLog> works = list.stream()
                .filter(s -> s.type == SessionLog.Type.WORK).collect(Collectors.toList());
        java.util.List<SessionLog> breaks = list.stream()
                .filter(s -> s.type == SessionLog.Type.BREAK).collect(Collectors.toList());

        out.put("workCount", works.size());
        out.put("workMinutes", works.stream().mapToInt(s -> s.minutes).sum());
        out.put("breakCount", breaks.size());
        out.put("breakMinutes", breaks.stream().mapToInt(s -> s.minutes).sum());
        return out;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalWork", repo.countByType(SessionLog.Type.WORK));
        out.put("totalBreak", repo.countByType(SessionLog.Type.BREAK));
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        out.put("todayWork", repo.findByFinishedAtGreaterThanEqual(startOfToday).stream()
                .filter(s -> s.type == SessionLog.Type.WORK).count());
        return out;
    }
}
