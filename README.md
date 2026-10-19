# Pomodoro v2

React (Vite) ön yüz + Java (Spring Boot 2.7) REST API + H2 veritabanı ile tam stack Pomodoro.
Zamanlayıcı tarayıcıda çalışır; tamamlanan her faz **sunucuya oturum olarak kaydedilir**.
localStorage sayaç yerine gerçek `session_logs` tablosu kullanılır.

## Özellikler

- 25 dk çalışma / 5 dk mola döngüsü, her faz bitişinde otomatik zincirleme
- Bitiş bip sesi
- **Bugün istatistiği API'den**: pomodoro sayısı, çalışma dakikası, mola sayısı/dakikası
- Son 10 oturum listesi (tür, süre, saat)

## Çalıştırma

```bash
cd backend && mvn spring-boot:run     # API :8080
cd frontend && npm install && npm run dev   # UI :5173 (proxy → 8080)
```

## API

| Metot | Yol | Açıklama |
|---|---|---|
| POST | `/api/sessions` | `{type: "WORK"\|"BREAK", minutes}` — tamamlanan fazı kaydet |
| GET | `/api/sessions/today` | Bugünün çalışma/mola toplamları |
| GET | `/api/sessions/recent` | Son 10 oturum |
| GET | `/api/stats` | `{totalWork, totalBreak, todayWork}` |

v1 tek dosyalık HTML sürümü git geçmişinde korunmaktadır.
