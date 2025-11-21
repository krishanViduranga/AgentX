"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ToolId = "age" | "mortgage" | "insurance" | "retirement";

const tools: { id: ToolId; title: string; description: string }[] = [
  {
    id: "age",
    title: "Age Calculator",
    description: "Find your exact age in years, months, and days.",
  },
  {
    id: "mortgage",
    title: "Mortgage Calculator",
    description: "Estimate monthly payments and total interest.",
  },
  {
    id: "insurance",
    title: "Insurance Needs Estimator",
    description: "Check how much life insurance you might really need.",
  },
  {
    id: "retirement",
    title: "Retirement Readiness Checker",
    description: "See if your savings match your future life plan.",
  },
];

export function ToolsPanel() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [open, setOpen] = useState(false);

  const openTool = (id: ToolId) => {
    setActiveTool(id);
    setOpen(true);
  };

  const closeTool = () => {
    setOpen(false);
    // optionally reset activeTool on close
    // setActiveTool(null);
  };

  const activeConfig = tools.find((t) => t.id === activeTool);

  return (
    <>
      {/* Cards area */}
      <div className="bg-primary/5 rounded-md p-4 sm:p-5 flex flex-col gap-4">
        <h3 className="text-xs sm:text-sm font-semibold text-primary/80 uppercase tracking-wide">
          Tools to plan smarter
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-background/60 rounded-md p-3 sm:p-4 border border-primary/10 flex flex-col gap-2"
            >
              <div className="text-sm sm:text-base font-medium">
                {tool.title}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {tool.description}
              </p>
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs sm:text-sm"
                  onClick={() => openTool(tool.id)}
                >
                  Open tool
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup (one dialog reused for all tools) */}
      <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : closeTool())}>
        <DialogContent className="max-w-lg w-full">
          {activeConfig && (
            <>
              <DialogHeader>
                <DialogTitle>{activeConfig.title}</DialogTitle>
                <DialogDescription>{activeConfig.description}</DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {activeTool === "age" && <AgeCalculator />}
                {activeTool === "mortgage" && <MortgageCalculator />}
                {activeTool === "insurance" && <InsuranceNeedsEstimator />}
                {activeTool === "retirement" && <RetirementChecker />}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------ Age Calculator ------------ */

function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCalc = () => {
    if (!dob) {
      setResult("Please select your date of birth.");
      return;
    }

    const birth = new Date(dob);
    const today = new Date();

    if (isNaN(birth.getTime())) {
      setResult("Invalid date.");
      return;
    }

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    setResult(`You are ${years} years, ${months} months, and ${days} days old.`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <label className="text-xs sm:text-sm flex flex-col gap-1 flex-1">
          Date of birth
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <Button size="sm" onClick={handleCalc}>
          Calculate age
        </Button>
      </div>
      {result && <p className="text-xs sm:text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}

/* ------------ Mortgage Calculator ------------ */

function MortgageCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCalc = () => {
    const P = Number(principal);
    const r = Number(rate) / 100 / 12;
    const n = Number(years) * 12;

    if (!P || !r || !n) {
      setResult("Please enter loan amount, rate, and term.");
      return;
    }

    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    const interest = total - P;

    setResult(
      `Estimated monthly payment: ¥${monthly.toFixed(
        0
      )}. Total interest over ${years} years: ¥${interest.toFixed(0)}.`
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Loan amount (¥)
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Interest rate (% per year)
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Term (years)
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
      </div>
      <Button size="sm" onClick={handleCalc}>
        Calculate payment
      </Button>
      {result && <p className="text-xs sm:text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}

/* ------------ Insurance Needs Estimator ------------ */

function InsuranceNeedsEstimator() {
  const [income, setIncome] = useState("");
  const [yearsToCover, setYearsToCover] = useState("");
  const [debts, setDebts] = useState("");
  const [savings, setSavings] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCalc = () => {
    const annualIncome = Number(income);
    const years = Number(yearsToCover);
    const totalDebts = Number(debts);
    const currentSavings = Number(savings);

    if (!annualIncome || !years) {
      setResult("Please enter at least income and years to cover.");
      return;
    }

    const incomeProtection = annualIncome * years;
    const needed = incomeProtection + totalDebts - currentSavings;

    if (needed <= 0) {
      setResult(
        "Based on these inputs, you may already have enough savings to cover income and debts."
      );
      return;
    }

    setResult(
      `Rough estimated life insurance need: ¥${needed.toLocaleString()} (covering income for ${years} years + debts minus current savings).`
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Annual income (¥)
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Years to protect
          <input
            type="number"
            value={yearsToCover}
            onChange={(e) => setYearsToCover(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Total debts (¥)
          <input
            type="number"
            value={debts}
            onChange={(e) => setDebts(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Current savings (¥)
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
      </div>
      <Button size="sm" onClick={handleCalc}>
        Estimate need
      </Button>
      {result && <p className="text-xs sm:text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}

/* ------------ Retirement Readiness Checker ------------ */

function RetirementChecker() {
  const [currentAge, setCurrentAge] = useState("");
  const [retireAge, setRetireAge] = useState("");
  const [savings, setSavings] = useState("");
  const [monthlyInvest, setMonthlyInvest] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCalc = () => {
    const age = Number(currentAge);
    const retire = Number(retireAge);
    const currentSavings = Number(savings);
    const monthly = Number(monthlyInvest);

    if (!age || !retire || retire <= age) {
      setResult("Please enter a valid current age and a higher retirement age.");
      return;
    }

    const years = retire - age;
    const months = years * 12;
    const assumedReturn = 0.04 / 12; // ~4% per year, monthly

    let futureValue = currentSavings * Math.pow(1 + assumedReturn, months);
    for (let i = 0; i < months; i++) {
      futureValue = futureValue * (1 + assumedReturn) + monthly;
    }

    setResult(
      `If you keep this pace with a simple 4% assumed return, you might have around ¥${futureValue.toFixed(
        0
      )} by age ${retire}. This is a rough estimate, not financial advice.`
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Current age
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Target retirement age
          <input
            type="number"
            value={retireAge}
            onChange={(e) => setRetireAge(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Current savings (¥)
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
        <label className="text-xs sm:text-sm flex flex-col gap-1">
          Monthly investment (¥)
          <input
            type="number"
            value={monthlyInvest}
            onChange={(e) => setMonthlyInvest(e.target.value)}
            className="border border-input rounded-md px-2 py-1 text-sm bg-background"
          />
        </label>
      </div>
      <Button size="sm" onClick={handleCalc}>
        Check projection
      </Button>
      {result && <p className="text-xs sm:text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
