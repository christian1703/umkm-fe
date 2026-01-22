export function formatDateTime(value: any): string {
    if (!value) return "-"

    try {
        const date = new Date(value)
        if (isNaN(date.getTime())) return value.toString()

        const dateStr = new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(date)

        const timeParts = new Intl.DateTimeFormat("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).formatToParts(date)

        const hour = timeParts.find(p => p.type === "hour")?.value
        const minute = timeParts.find(p => p.type === "minute")?.value
        const second = timeParts.find(p => p.type === "second")?.value

        const timeStr = `${hour}:${minute}:${second}`

        return `${dateStr}, ${timeStr}`
    } catch {
        return value.toString()
    }
}


export const getNowDateTimeLocal = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};