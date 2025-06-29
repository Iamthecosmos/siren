import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Calculator() {
  const navigate = useNavigate();
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState("");
  const [operation, setOperation] = useState("");
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [secretSequence, setSecretSequence] = useState("");
  const [secretCode, setSecretCode] = useState("");

  useEffect(() => {
    // Get custom secret code from localStorage
    const savedCode = localStorage.getItem("siren_secret_code");
    if (savedCode) {
      setSecretCode(savedCode);
    } else {
      // Fallback to default if no custom code set
      setSecretCode("1234567890");
    }
  }, []);

  useEffect(() => {
    if (secretSequence && secretCode && secretSequence === secretCode) {
      navigate("/");
      setSecretSequence("");
    }
  }, [secretSequence, secretCode, navigate]);

  const inputNumber = (num: string) => {
    // Track secret sequence
    const newSequence = secretSequence + num;
    if (secretCode && secretCode.startsWith(newSequence)) {
      setSecretSequence(newSequence);
    } else {
      setSecretSequence(num);
    }

    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    // Track secret sequence for operation symbols too
    const newSequence = secretSequence + nextOperation;
    if (secretCode && secretCode.startsWith(newSequence)) {
      setSecretSequence(newSequence);
    } else if (secretSequence !== "") {
      setSecretSequence("");
    }

    const inputValue = parseFloat(display);

    if (previousValue === "") {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string,
  ) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue && operation) {
      const currentValue = parseFloat(previousValue);
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue("");
      setOperation("");
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue("");
    setOperation("");
    setWaitingForNewValue(false);
    setSecretSequence("");
  };

  const clearEntry = () => {
    setDisplay("0");
    setWaitingForNewValue(false);
    // Don't reset secret sequence on CE - only on C
  };

  const inputPercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const buttons = [
    {
      label: "C",
      action: clear,
      className: "bg-muted hover:bg-muted/80 text-foreground",
    },
    {
      label: "CE",
      action: clearEntry,
      className: "bg-muted hover:bg-muted/80 text-foreground",
    },
    {
      label: "%",
      action: inputPercent,
      className: "bg-muted hover:bg-muted/80 text-foreground",
    },
    {
      label: "÷",
      action: () => inputOperation("÷"),
      className: "bg-trust hover:bg-trust/90 text-trust-foreground",
    },

    {
      label: "7",
      action: () => inputNumber("7"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "8",
      action: () => inputNumber("8"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "9",
      action: () => inputNumber("9"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "×",
      action: () => inputOperation("×"),
      className: "bg-trust hover:bg-trust/90 text-trust-foreground",
    },

    {
      label: "4",
      action: () => inputNumber("4"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "5",
      action: () => inputNumber("5"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "6",
      action: () => inputNumber("6"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "-",
      action: () => inputOperation("-"),
      className: "bg-trust hover:bg-trust/90 text-trust-foreground",
    },

    {
      label: "1",
      action: () => inputNumber("1"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "2",
      action: () => inputNumber("2"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "3",
      action: () => inputNumber("3"),
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "+",
      action: () => inputOperation("+"),
      className: "bg-trust hover:bg-trust/90 text-trust-foreground",
    },

    {
      label: "0",
      action: () => inputNumber("0"),
      className: "bg-background hover:bg-muted text-foreground col-span-2",
    },
    {
      label: ".",
      action: inputDecimal,
      className: "bg-background hover:bg-muted text-foreground",
    },
    {
      label: "=",
      action: performCalculation,
      className: "bg-trust hover:bg-trust/90 text-trust-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="p-6 space-y-4">
          {/* App Title */}
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Calculator
            </h1>
          </div>

          {/* Display */}
          <div className="bg-muted/30 rounded-lg p-4 min-h-[80px] flex items-center justify-end">
            <div className="text-right">
              {previousValue && operation && (
                <div className="text-sm text-muted-foreground">
                  {previousValue} {operation}
                </div>
              )}
              <div className="text-3xl font-mono font-medium text-foreground break-all">
                {display}
              </div>
            </div>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.action}
                className={`h-14 text-lg font-medium ${button.className} ${
                  button.label === "0" ? "col-span-2" : ""
                }`}
                variant="outline"
              >
                {button.label}
              </Button>
            ))}
          </div>

          {/* Secret hint */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Scientific Calculator v2.1{" "}
              {secretCode && secretCode !== "1234567890" ? "• Custom Mode" : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
