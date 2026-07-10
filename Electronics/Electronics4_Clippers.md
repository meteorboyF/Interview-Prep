# **Part 4: Clipper Circuits**

## **4.1 What problem it solves**

A clipper (also called a limiter) is a wave-shaping circuit that removes (clips off) the part of a signal above and/or below a certain voltage level, while leaving the rest of the waveform unchanged. It is used to protect circuits from voltage spikes, to shape waveforms (for example converting a sine wave toward a square wave), and in signal limiting applications.

## **4.2 How to teach it**

Analogy: a clipper is like a ceiling in a room, anything below the ceiling height passes through untouched, but anything that would go above it gets physically stopped at the ceiling level and flattened there. The diode acts as a switch that 'turns on' exactly at the clipping voltage, diverting or blocking the signal beyond that point.

## **4.3 Series vs Parallel (Shunt) Clippers, the key structural distinction**

This is the first classification to master: where the diode physically sits in the circuit relative to the signal path.

-   Series clipper: the diode sits directly in the main signal path, between the input and the output. When the diode is OFF (reverse biased), no signal reaches the output at all during that portion of the cycle. When ON, the signal passes through nearly unchanged (minus the small diode drop).
-   Shunt (parallel) clipper: the diode branches off to the side, connected in parallel across the output, not in the direct path. When the diode is OFF, the signal passes through the series resistor to the output largely unaffected. When ON, the diode acts as a low-resistance short to the reference level, pulling the output down to (or clamping it at) that level, this is what does the actual clipping.

![Electronics figure 4](/Interview-Prep/electronics/fig-4.png)

_Figure 4: Circuit topology comparison. In a series clipper the diode is in the direct signal path; in a shunt clipper the diode branches off in parallel across the output._

| Aspect | Series Clipper | Shunt (Parallel) Clipper |
| --- | --- | --- |
| Diode position | In the main signal path | Branches off, parallel to the output |
| When diode is OFF | Output = 0 (signal fully blocked) | Output ≈ input (passes through) |
| When diode is ON | Output ≈ input (passes through) | Output clamped to the reference level (clipped) |
| Output impedance when not clipping | Depends on load, diode is out of the path | Set mainly by the series resistor |

## **4.4 Positive vs Negative Clippers**

-   Positive clipper: removes (flattens) the portion of the waveform above a chosen positive reference level, leaving the rest of the waveform, including everything below that level, unchanged.
-   Negative clipper: removes the portion of the waveform below a chosen negative reference level.
-   Biased clipper: adds a DC reference voltage (a battery or voltage divider) in series with the diode, allowing the clipping level to be set to any desired voltage, not just 0V.

![Electronics figure 5](/Interview-Prep/electronics/fig-5.png)

_Figure 5: Positive clipper output (top clipped flat at +2V) and negative clipper output (bottom clipped flat at -2V)._

## **4.5 When to use clippers**

-   Protecting sensitive circuit inputs from voltage spikes exceeding a safe threshold.
-   Wave-shaping: converting a sine wave into something closer to a square wave by clipping both peaks heavily.
-   Amplitude limiting in communication and signal processing circuits.

## **4.6 When clippers are not the right tool**

-   If the goal is to shift a waveform's DC level without changing its shape at all (rather than cutting off part of it), a clamper is the correct circuit, not a clipper, see Part 5.
-   If full-wave AC-to-DC conversion is needed (not just limiting peaks), a rectifier is the correct circuit, not a clipper.

## **4.7 Interview Q&A**

**Q: What is the fundamental structural difference between a series and a shunt (parallel) clipper?**

**A:** In a series clipper, the diode is placed directly in the signal path between input and output, so when it is OFF, the signal is completely blocked. In a shunt clipper, the diode branches off in parallel across the output, so when it is OFF, the signal passes through the series resistor largely unaffected, and it is the diode turning ON that actively pulls the output down to the clipping level.

**Q: How would you design a clipper that removes voltage above +5V, using a shunt configuration?**

**A:** Place a series resistor between input and output, then a diode in parallel across the output in series with a 5V reference battery, oriented so the diode only conducts (turns ON) once the output tries to exceed 5V, at which point it clamps the output at that level. Below 5V the diode stays OFF and the signal passes through unaffected.

**Q: Why does a clipper distort a signal's shape, while a clamper does not?**

**A:** A clipper actively removes (cuts off) part of the waveform whenever it crosses the reference level, changing its shape. A clamper instead adds a fixed DC offset to every point of the waveform equally, shifting the entire waveform up or down as a whole without altering its shape at all.

## **4.8 Tips and tricks**

-   Always identify series vs shunt first, before positive vs negative, it is the more fundamental classification and the one most commonly tested first.
-   When drawing the output waveform, draw the unclipped input lightly first as a reference, then draw the clipped output over it, flat at the clipping level wherever the input would have exceeded it.
