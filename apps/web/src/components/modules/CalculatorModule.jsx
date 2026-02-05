"use client";

import { useState, useEffect } from "react";
import { Delete } from "lucide-react";

export default function CalculatorModule({ data, onDataUpdate }) {
  const [display, setDisplay] = useState(data?.display || "0");
  const [previousValue, setPreviousValue] = useState(
    data?.previousValue || null,
  );
  const [operation, setOperation] = useState(data?.operation || null);

  // Sync local state with incoming data
  useEffect(() => {
    if (data?.display !== undefined && data.display !== display) {
      setDisplay(data.display);
    }
  }, [data?.display]);

  const handleNumber = (num) => {
    const newDisplay = display === "0" ? num.toString() : display + num;
    setDisplay(newDisplay);
    onDataUpdate({ ...data, display: newDisplay });
  };

  const handleOperation = (op) => {
    const currentValue = parseFloat(display);
    setPreviousValue(currentValue);
    setOperation(op);
    setDisplay("0");
    onDataUpdate({
      ...data,
      display: "0",
      previousValue: currentValue,
      operation: op,
    });
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      let result = 0;
      switch (operation) {
        case "+":
          result = previousValue + current;
          break;
        case "-":
          result = previousValue - current;
          break;
        case "*":
          result = previousValue * current;
          break;
        case "/":
          result = previousValue / current;
          break;
      }
      const resultStr = result.toString();
      setDisplay(resultStr);
      setPreviousValue(null);
      setOperation(null);
      onDataUpdate({
        ...data,
        display: resultStr,
        previousValue: null,
        operation: null,
        result: result,
      });
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    onDataUpdate({
      ...data,
      display: "0",
      previousValue: null,
      operation: null,
    });
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      const newDisplay = display + ".";
      setDisplay(newDisplay);
      onDataUpdate({ ...data, display: newDisplay });
    }
  };

  const Button = ({ children, onClick, className = "" }) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-xl bg-white/60 hover:bg-white/80 border border-gray-200 text-gray-700 font-semibold transition-all active:scale-95 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full p-4 flex flex-col gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
        <div className="text-right text-3xl font-mono text-gray-800 overflow-hidden">
          {display}
        </div>
        {operation && (
          <div className="text-right text-xs text-gray-500 mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button
          onClick={handleClear}
          className="col-span-3 bg-red-100 hover:bg-red-200"
        >
          <Delete className="inline h-5 w-5" />
        </Button>
        <Button onClick={() => handleOperation("/")}>/</Button>

        <Button onClick={() => handleNumber(7)}>7</Button>
        <Button onClick={() => handleNumber(8)}>8</Button>
        <Button onClick={() => handleNumber(9)}>9</Button>
        <Button onClick={() => handleOperation("*")}>×</Button>

        <Button onClick={() => handleNumber(4)}>4</Button>
        <Button onClick={() => handleNumber(5)}>5</Button>
        <Button onClick={() => handleNumber(6)}>6</Button>
        <Button onClick={() => handleOperation("-")}>−</Button>

        <Button onClick={() => handleNumber(1)}>1</Button>
        <Button onClick={() => handleNumber(2)}>2</Button>
        <Button onClick={() => handleNumber(3)}>3</Button>
        <Button onClick={() => handleOperation("+")}>+</Button>

        <Button onClick={() => handleNumber(0)} className="col-span-2">
          0
        </Button>
        <Button onClick={handleDecimal}>.</Button>
        <Button
          onClick={handleEquals}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          =
        </Button>
      </div>
    </div>
  );
}

export const CalculatorModuleConfig = {
  handles: {
    inputs: [{ id: "input", position: "left", label: "Input" }],
    outputs: [{ id: "result", position: "right", label: "Result" }],
  },
};
