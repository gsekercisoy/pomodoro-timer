package com.acrom.pomodoro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.persistence.*;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_logs")
public class SessionLog {

    public enum Type { WORK, BREAK }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    public Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 6)
    @JsonProperty("type")
    public Type type = Type.WORK;

    @Min(1) @Max(180)
    @Column(nullable = false)
    @JsonProperty("minutes")
    public int minutes = 25;

    @JsonProperty("startedAt")
    public LocalDateTime startedAt = LocalDateTime.now();

    @JsonProperty("finishedAt")
    public LocalDateTime finishedAt = LocalDateTime.now();
}
