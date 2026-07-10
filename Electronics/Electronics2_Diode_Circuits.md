# **Part 2: Diode DC Circuits (Analysis Models)**

## **2.1 What this topic covers**

A real diode's V-I curve is non-linear (a curve, not a straight line), which makes exact circuit analysis by hand difficult. This topic covers the three standard approximations used to analyse diode circuits, ranging from simplest to most accurate, and how to solve a basic diode DC circuit using each.

## **2.2 How to teach it**

Analogy: think of a diode like a one-way turnstile with a bit of initial resistance. The simplest model (ideal diode) treats it as a perfect one-way gate, either fully open (0 resistance) or fully shut (infinite resistance), with no cost to push through. More realistic models add a 'toll' (the 0.7V drop) and even a bit of friction (a small forward resistance) to better match a real diode's behaviour.

## **2.3 The three approximation models**

**Model 1: Ideal Diode**

The diode is treated as a perfect switch: zero resistance (a short circuit, 0V drop) when forward biased and conducting, infinite resistance (an open circuit) when reverse biased. Simplest to use, least accurate, good for quick first-pass analysis or when the source voltage is very large compared to 0.7V.

**Model 2: Constant Voltage Drop (Practical Diode)**

The diode is treated as a closed switch in series with a fixed voltage source of 0.7V (silicon) when conducting, and an open circuit when reverse biased. This is the most commonly used model for hand calculations, it balances simplicity and accuracy well.

**Model 3: Piecewise Linear (with forward resistance)**

Adds a small forward resistance Rf in series with the 0.7V drop when conducting, modelling the real diode's slight slope past the knee voltage rather than a perfectly vertical rise. Most accurate of the three hand-calculation models, used when precision matters.

| Model | Forward bias (conducting) | Reverse bias | Accuracy vs simplicity |
| --- | --- | --- | --- |
| Ideal diode | 0V drop (short circuit) | Open circuit | Simplest, least accurate |
| Constant voltage drop | 0.7V drop (Si), open circuit otherwise | Open circuit | Standard, good balance |
| Piecewise linear | 0.7V + I x Rf drop | Open circuit | Most accurate, more work |

## **2.4 Worked example (Constant Voltage Drop model)**

_A circuit has a 5V DC source, a series resistor R = 1kΩ, and a silicon diode, all in series, forming a simple loop._

-   Step 1: Assume the diode is forward biased and conducting (check the source polarity supports this direction), so it behaves as a 0.7V drop.
-   Step 2: Apply Kirchhoff's Voltage Law around the loop: 5V = V\_R + V\_D = I\*R + 0.7V.
-   Step 3: Solve for current: I = (5 - 0.7) / 1000 = 4.3 / 1000 = 4.3 mA.
-   Step 4: Verify the assumption, since I came out positive (current flows in the assumed forward direction), the diode is indeed conducting, the assumption was valid.

## **2.5 The assume-and-check method (general procedure)**

-   1\. Assume a state for the diode (either 'ON, conducting' or 'OFF, not conducting').
-   2\. Replace the diode with its model for that assumed state (0.7V source if ON, open circuit if OFF) and solve the resulting simple linear circuit.
-   3\. Check the assumption: if assumed ON, verify the calculated current through the diode is positive (flows in the forward direction); if assumed OFF, verify the voltage across the diode is at or below the cut-in voltage (does not exceed 0.7V) and would not forward-bias it.
-   4\. If the check fails, the assumption was wrong, flip it and redo the analysis with the other state.

## **2.6 When to use each model**

-   Ideal diode model: quick estimates, or when the source voltage is much larger than 0.7V (making the 0.7V drop nearly negligible by comparison).
-   Constant voltage drop model: the default choice for most homework and exam problems, a good balance of simplicity and realistic accuracy.
-   Piecewise linear model: when the problem specifically gives a forward resistance value, or when precision at low currents matters.

## **2.7 Interview Q&A**

**Q: Why do we need to 'assume and check' the diode's state rather than solving directly?**

**A:** A diode's behaviour is fundamentally non-linear and conditional, it is a completely different circuit element (0.7V source vs open circuit) depending on its bias direction, which itself depends on the very currents and voltages we are trying to solve for. Assuming a state turns the problem into a simple linear circuit we can solve directly, then we verify the assumption was self-consistent.

**Q: In a circuit with multiple diodes, how does the assume-and-check method scale?**

**A:** Every diode needs its own ON/OFF assumption, giving 2^n possible combinations for n diodes. In practice, circuit topology and source polarities usually rule out most combinations quickly, so only a few plausible combinations need to be checked, not all 2^n exhaustively.

**Q: Why is the constant voltage drop model preferred over the ideal diode model for most practical calculations?**

**A:** The ideal model ignores the very real ~0.7V threshold a silicon diode needs before conducting meaningfully, which can cause significant error in circuits where the source voltage is only a few volts, comparable in size to that 0.7V drop. The constant voltage drop model captures this at very little extra calculation cost.

## **2.8 Tips and tricks**

-   Always state which model you are using at the start of a problem, exam questions often specify it explicitly, using the wrong model is a common way to lose marks even with otherwise correct working.
-   After solving, always sanity-check the sign of the current or the diode voltage against your assumption, this single habit catches most diode-circuit mistakes.
