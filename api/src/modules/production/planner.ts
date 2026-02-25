export interface PlannableJob {
  id: string;
  orderItemId: number;
  estimatedHours: number;
  priority: number; // чем выше число, тем выше приоритет
}

export interface PrinterSlot {
  id: number;
  name: string;
  availableFrom: Date;
}

export interface PlannedJob {
  jobId: string;
  printerId: number;
  startAt: Date;
  endAt: Date;
}

/**
 * Простейший жадный планировщик:
 * 1. Сортирует задания по приоритету (убывание), затем по времени выполнения (возрастание).
 * 2. Каждое следующее задание отдаёт принтеру, который освободится раньше всех.
 */
export function planJobs(jobs: PlannableJob[], printers: PrinterSlot[]): PlannedJob[] {
  if (printers.length === 0 || jobs.length === 0) return [];

  const sortedJobs = [...jobs].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.estimatedHours - b.estimatedHours;
  });

  const printerStates = printers.map((p) => ({ ...p }));
  const result: PlannedJob[] = [];

  for (const job of sortedJobs) {
    // выбираем принтер, который освободится раньше других
    let bestPrinter = printerStates[0];
    for (const printer of printerStates) {
      if (printer.availableFrom < bestPrinter.availableFrom) {
        bestPrinter = printer;
      }
    }

    const startAt = new Date(bestPrinter.availableFrom);
    const endAt = new Date(startAt.getTime() + job.estimatedHours * 60 * 60 * 1000);

    result.push({
      jobId: job.id,
      printerId: bestPrinter.id,
      startAt,
      endAt,
    });

    bestPrinter.availableFrom = endAt;
  }

  return result;
}

