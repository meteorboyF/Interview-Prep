# **Part 3: Rectifiers**

## **3.1 What problem it solves**

A rectifier converts alternating current (AC), which periodically reverses direction, into direct current (DC), which flows in one direction only. This is the essential first stage of almost every power supply, since most electronics need steady DC power but mains electricity is supplied as AC. A diode is the natural building block for this, since it only allows current to flow in one direction.

## **3.2 How to teach it**

Analogy: a rectifier is like a one-way valve in a pipe carrying water that sloshes back and forth (AC). The valve (diode) only lets water through when it is moving in one direction, blocking the reverse sloshes entirely, so what emerges on the other side is water that only ever flows one way, even though it still pulses in strength.

## **3.3 Half-Wave Rectifier**

The simplest rectifier: a single diode in series with the load. During the half-cycle where the AC input is positive (forward-biasing the diode), current flows through the load. During the negative half-cycle, the diode is reverse biased and blocks current entirely, so the load sees nothing during that half.

![Electronics figure 3](/Interview-Prep/electronics/fig-3.png)

_Figure 3: Half-wave rectifier input and output waveforms. Only the positive half-cycles reach the output; the negative half-cycles are completely blocked._

**Key half-wave rectifier formulas**

| Quantity | Formula | Notes |
| --- | --- | --- |
| Average (DC) output voltage | Vdc = Vm / π ≈ 0.318 Vm | Vm = peak input voltage |
| RMS output voltage | Vrms = Vm / 2 | - |
| Ripple factor | r ≈ 1.21 | High ripple, output is far from pure DC |
| Rectification efficiency | ≈ 40.6% | At most 40.6% of AC input power becomes DC output power |
| Peak Inverse Voltage (PIV) | PIV = Vm | Maximum reverse voltage the diode must withstand without breaking down |

## **3.4 Full-Wave Rectifier (for comparison)**

A full-wave rectifier uses either a centre-tapped transformer with two diodes, or a bridge configuration with four diodes, to make use of both halves of the AC cycle, the negative half-cycle is flipped rather than discarded, so current flows through the load during the entire cycle, not just half of it.

## **3.5 Half-Wave vs Full-Wave Comparison**

| Property | Half-Wave | Full-Wave (bridge) |
| --- | --- | --- |
| Diodes needed | 1 | 4 (bridge) or 2 (centre-tapped) |
| Output during | Only one half-cycle | Both half-cycles |
| Average DC output | Vm / π ≈ 0.318 Vm | 2Vm / π ≈ 0.636 Vm |
| Ripple factor | ≈ 1.21 (high) | ≈ 0.48 (lower, smoother) |
| Efficiency | ≈ 40.6% | ≈ 81.2% |
| PIV per diode | Vm | Vm (bridge) or 2Vm (centre-tapped) |

## **3.6 When to use half-wave vs full-wave**

-   Half-wave: acceptable only where simplicity and low cost matter far more than efficiency or smoothness, for example very low-power, non-critical applications, or simple signal-envelope detection.
-   Full-wave: the standard choice for any real power supply, significantly better efficiency, lower ripple, and easier to smooth with a filter capacitor into usable DC.

## **3.7 When rectifiers alone are not enough**

-   A rectifier alone produces pulsating DC (a series of humps), not smooth DC, a filter capacitor (or more elaborate filter) is needed afterward to smooth the ripple into something closer to constant voltage, this is a natural next step beyond this syllabus section but worth mentioning if asked 'is this ready to power a circuit?'

## **3.8 Interview Q&A**

**Q: Why is the ripple factor of a half-wave rectifier so much higher than a full-wave rectifier?**

**A:** A half-wave rectifier's output is zero for half of every cycle, creating a large gap between pulses, which corresponds to a large AC component relative to the DC average. A full-wave rectifier fills in that gap using the other half-cycle, keeping the output closer to its average value throughout, hence a much lower ripple factor.

**Q: What is Peak Inverse Voltage (PIV), and why does it matter when selecting a diode?**

**A:** PIV is the maximum reverse voltage the diode experiences during the blocking half-cycle. If a diode's rated maximum reverse voltage is exceeded, it can suffer reverse breakdown and be damaged, so the diode chosen for a rectifier must have a PIV rating comfortably above the circuit's calculated PIV.

**Q: Why is a full-wave rectifier's efficiency exactly double that of a half-wave rectifier (81.2% vs 40.6%)?**

**A:** Both rectifiers have the same fundamental loss mechanism per conducting half-cycle, but the half-wave rectifier only conducts, and therefore only delivers power, during half of the input cycle, wasting the other half entirely. The full-wave rectifier makes use of both halves, doubling the average power delivered for the same input, which doubles the efficiency.

## **3.9 Tips and tricks**

-   Memorise the Vdc formulas (Vm/π for half-wave, 2Vm/π for full-wave) cold, they are used to derive almost every other quantity (ripple, efficiency) in rectifier problems.
-   Always state PIV explicitly when asked to 'design' or 'select a diode for' a rectifier circuit, it is a very common mark-scoring detail that is easy to forget.
-   If asked to draw the output waveform, get the shape right first (which half is missing/present) before worrying about exact voltage labels, the shape is what is usually being tested.
