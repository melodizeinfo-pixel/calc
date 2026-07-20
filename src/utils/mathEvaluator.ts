/**
 * Safe Mathematical Expression Parser & Evaluator
 * Supports: +, -, *, /, ^, %, parentheses, constants (π, e), functions (sin, cos, tan, log, ln, sqrt, abs, fact), and Degrees/Radians modes.
 */

export function evaluateExpression(expression: string, isDegree: boolean = false): number {
  // Pre-process expression to make it parser-friendly
  let prepared = expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "Math.PI")
    .replace(/e/g, "Math.E")
    .trim();

  // Helper: check if a character is a digit
  const isDigit = (ch: string) => /[0-9.]/.test(ch);

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  while (i < prepared.length) {
    const ch = prepared[i];
    if (ch === " ") {
      i++;
      continue;
    }

    if (isDigit(ch)) {
      let numStr = "";
      while (i < prepared.length && (isDigit(prepared[i]) || prepared[i] === ".")) {
        numStr += prepared[i];
        i++;
      }
      tokens.push(numStr);
    } else if (/[a-zA-Z]/.test(ch)) {
      let funcStr = "";
      while (i < prepared.length && /[a-zA-Z0-9_.]/.test(prepared[i])) {
        funcStr += prepared[i];
        i++;
      }
      tokens.push(funcStr);
    } else if (
      ch === "+" ||
      ch === "-" ||
      ch === "*" ||
      ch === "/" ||
      ch === "^" ||
      ch === "%" ||
      ch === "(" ||
      ch === ")" ||
      ch === "!"
    ) {
      tokens.push(ch);
      i++;
    } else {
      // Ignore or throw on unrecognized characters
      throw new Error(`Carácter no reconocido: "${ch}"`);
    }
  }

  let tokenIdx = 0;
  const peek = () => (tokenIdx < tokens.length ? tokens[tokenIdx] : "");
  const consume = () => (tokenIdx < tokens.length ? tokens[tokenIdx++] : "");

  // Factorial helper
  const factorial = (n: number): number => {
    if (n < 0) throw new Error("Factorial de negativo no definido");
    if (!Number.isInteger(n)) throw new Error("Factorial solo para enteros");
    let res = 1;
    for (let j = 2; j <= n; j++) res *= j;
    return res;
  };

  // Parsing precedence:
  // Expression -> Term ((+ | -) Term)*
  // Term       -> Factor ((* | / | %) Factor)*
  // Factor     -> Power (^ Power)*
  // Power      -> Unary
  // Unary      -> (+ | -) Unary | Postfix
  // Postfix    -> Primary (!)?
  // Primary    -> Number | Constant | Parenthesized | FunctionCall

  function parseExpression(): number {
    let val = parseTerm();
    while (true) {
      const op = peek();
      if (op === "+" || op === "-") {
        consume();
        const nextVal = parseTerm();
        if (op === "+") val += nextVal;
        else val -= nextVal;
      } else {
        break;
      }
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseFactor();
    while (true) {
      const op = peek();
      if (op === "*" || op === "/" || op === "%") {
        consume();
        const nextVal = parseFactor();
        if (op === "*") {
          val *= nextVal;
        } else if (op === "/") {
          if (nextVal === 0) throw new Error("División por cero");
          val /= nextVal;
        } else {
          val %= nextVal;
        }
      } else {
        break;
      }
    }
    return val;
  }

  function parseFactor(): number {
    let val = parsePower();
    while (true) {
      const op = peek();
      if (op === "^") {
        consume();
        const nextVal = parsePower();
        val = Math.pow(val, nextVal);
      } else {
        break;
      }
    }
    return val;
  }

  function parsePower(): number {
    return parseUnary();
  }

  function parseUnary(): number {
    const op = peek();
    if (op === "+" || op === "-") {
      consume();
      const val = parseUnary();
      return op === "+" ? val : -val;
    }
    return parsePostfix();
  }

  function parsePostfix(): number {
    let val = parsePrimary();
    if (peek() === "!") {
      consume();
      val = factorial(val);
    }
    return val;
  }

  function parsePrimary(): number {
    const token = peek();
    if (!token) {
      throw new Error("Fin inesperado de la expresión");
    }

    if (token === "(") {
      consume(); // consume "("
      const val = parseExpression();
      if (consume() !== ")") {
        throw new Error("Paréntesis sin cerrar");
      }
      return val;
    }

    // Check if it is a function call
    if (
      [
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "log",
        "ln",
        "sqrt",
        "abs",
        "Math.PI",
        "Math.E",
      ].includes(token)
    ) {
      consume();
      if (token === "Math.PI") return Math.PI;
      if (token === "Math.E") return Math.E;

      // Expecting standard function call: func(expression)
      // Note: sometimes users type cos(45). We support func(val) or implicit func val
      const hasParen = peek() === "(";
      if (hasParen) consume(); // consume "("

      let argVal = parseExpression();

      if (hasParen) {
        if (consume() !== ")") {
          throw new Error(`Paréntesis sin cerrar para ${token}`);
        }
      }

      switch (token) {
        case "sin":
          return Math.sin(isDegree ? (argVal * Math.PI) / 180 : argVal);
        case "cos":
          return Math.cos(isDegree ? (argVal * Math.PI) / 180 : argVal);
        case "tan":
          return Math.tan(isDegree ? (argVal * Math.PI) / 180 : argVal);
        case "asin":
          const asinVal = Math.asin(argVal);
          return isDegree ? (asinVal * 180) / Math.PI : asinVal;
        case "acos":
          const acosVal = Math.acos(argVal);
          return isDegree ? (acosVal * 180) / Math.PI : acosVal;
        case "atan":
          const atanVal = Math.atan(argVal);
          return isDegree ? (atanVal * 180) / Math.PI : atanVal;
        case "log":
          if (argVal <= 0) throw new Error("Logaritmo de no positivo");
          return Math.log10(argVal);
        case "ln":
          if (argVal <= 0) throw new Error("Logaritmo natural de no positivo");
          return Math.log(argVal);
        case "sqrt":
          if (argVal < 0) throw new Error("Raíz de número negativo");
          return Math.sqrt(argVal);
        case "abs":
          return Math.abs(argVal);
        default:
          throw new Error(`Función desconocida: ${token}`);
      }
    }

    // Should be a number
    const num = Number(token);
    if (isNaN(num)) {
      throw new Error(`Token inválido: "${token}"`);
    }
    consume();
    return num;
  }

  const finalResult = parseExpression();
  if (tokenIdx < tokens.length) {
    throw new Error(`Sintaxis inválida después de: "${tokens[tokenIdx]}"`);
  }
  return finalResult;
}
