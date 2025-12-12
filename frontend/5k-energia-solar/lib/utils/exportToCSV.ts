// Utility function to export data to a CSV file
export function exportToCSV(data, filename) {
  if (!data || !data.length) {
    console.error("No data available to export.");
    return;
  }

  const csvContent = [
    Object.keys(data[0]).join(","), // Header row
    ...data.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}