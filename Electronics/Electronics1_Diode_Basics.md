# **Part 0: Energy Bands and Semiconductor Basics**

Every solid material's electrical behaviour comes down to how its electrons are distributed across two key energy ranges: the valence band (where electrons are bound to individual atoms) and the conduction band (where electrons are free to move and carry current). The gap between them, the band gap, determines whether a material conducts electricity easily, not at all, or somewhere in between.

## **How to teach it**

Analogy: think of the valence band as the ground floor of a building where electrons are 'parked' and bound to their atoms, and the conduction band as the open rooftop where electrons are free to roam and carry current. The band gap is the height of the staircase an electron must climb to get from the ground floor to the rooftop. In a conductor, the two floors overlap, electrons wander onto the roof with no effort. In an insulator, the staircase is enormous, almost no electron has enough energy to climb it. A semiconductor's staircase is just short enough that a little heat or voltage can push electrons up it.

![Electronics figure 1](/Interview-Prep/electronics/fig-1.png)

_Figure 1: Energy band structure comparison. Conductors have overlapping bands (no gap), semiconductors have a small gap (~1.1 eV for silicon), and insulators have a very large gap._

## **Conductors, Semiconductors, and Insulators**

| Material type | Band gap | Behaviour |
| --- | --- | --- |
| Conductor (e.g. copper) | 0 eV, bands overlap | Free electrons available at any temperature, conducts easily |
| Semiconductor (e.g. silicon, germanium) | Small, ~1.1 eV (Si), ~0.7 eV (Ge) | Insulator at absolute zero, conducts increasingly well as temperature rises or with added impurities |
| Insulator (e.g. glass, rubber) | Large, 5 eV or more | Practically no electrons can cross the gap under normal conditions |

## **Intrinsic vs Extrinsic Semiconductors**

-   Intrinsic semiconductor: a pure semiconductor crystal (pure silicon or germanium) with no added impurities. At room temperature it conducts only weakly, since only a small number of electrons gain enough thermal energy to jump the band gap, each leaving behind a 'hole' (a missing electron, treated as a positive charge carrier).
-   Extrinsic semiconductor: an intrinsic semiconductor with deliberately added impurity atoms (doping) to dramatically increase conductivity in a controlled way.
-   N-type: doped with a pentavalent impurity (5 valence electrons, e.g. Phosphorus or Arsenic), contributing extra free electrons. Electrons are the majority carriers.
-   P-type: doped with a trivalent impurity (3 valence electrons, e.g. Boron or Gallium), creating extra holes. Holes are the majority carriers.

## **Interview Q&A**

**Q: Why does a semiconductor conduct better as temperature increases, while a conductor's conductivity decreases?**

**A:** In a semiconductor, higher temperature gives more electrons enough thermal energy to jump the band gap into the conduction band, increasing the number of charge carriers. In a conductor, carriers are already abundant regardless of temperature, so rising temperature only increases atomic vibrations that scatter electrons more, increasing resistance instead.

**Q: What is the difference between doping to create n-type versus p-type material?**

**A:** N-type doping adds pentavalent impurity atoms (5 valence electrons) which contribute an extra loosely-bound electron each, so electrons become the majority carrier. P-type doping adds trivalent impurity atoms (3 valence electrons) which create a shortage, a hole, at each impurity site, so holes become the majority carrier.

**Q: Why can't an insulator be made to conduct just by heating it, the way a semiconductor can?**

**A:** An insulator's band gap (5 eV or more) is far too large for any practically achievable thermal energy to bridge, whereas a semiconductor's much smaller gap (~1.1 eV for silicon) is within reach of ordinary thermal energy at or above room temperature.

## **Tips and tricks**

-   If asked to compare the three material types, always lead with the band gap size, it is the single fact that explains all their differing behaviour.
-   Remember holes are not real particles, they are a convenient way to describe the movement of the surrounding electrons filling a vacancy, but they behave exactly like positive charge carriers for circuit analysis purposes.

# **Part 1: The Semiconductor (P-N Junction) Diode**

## **1.1 What it is and how to teach it**

A diode is formed by joining a p-type and an n-type semiconductor together, creating a p-n junction. Analogy: imagine two rooms, one crowded with free electrons (n-type) and one crowded with holes (p-type), connected by a doorway. Electrons near the doorway diffuse into the hole-rich room and recombine, and holes diffuse the other way, this leaves a narrow zone right at the junction stripped of free carriers, called the depletion region, with a small built-in electric field (barrier potential) that opposes further diffusion once equilibrium is reached.

-   Depletion region: the narrow zone at the junction with no free charge carriers, acting as an insulating barrier.
-   Barrier potential (built-in voltage): approximately 0.7V for silicon, 0.3V for germanium, the voltage that must be overcome to make the diode conduct significantly.
-   Anode: the p-type terminal. Cathode: the n-type terminal (marked with a stripe on the physical component).

## **1.2 Forward Bias vs Reverse Bias**

-   Forward bias: positive terminal of the source connected to the p-side (anode), negative to the n-side (cathode). This pushes electrons and holes toward the junction, narrowing the depletion region. Once the applied voltage exceeds the barrier potential (~0.7V for silicon), the diode conducts and current flows easily.
-   Reverse bias: positive terminal connected to the n-side, negative to the p-side. This pulls carriers away from the junction, widening the depletion region and blocking current, only a tiny reverse saturation (leakage) current flows, until the reverse voltage becomes large enough to cause breakdown.

![Electronics figure 2](/Interview-Prep/electronics/fig-2.png)

_Figure 2: Diode V-I characteristic curve. Forward bias shows a sharp current rise past the cut-in voltage; reverse bias shows only a small leakage current until breakdown._

## **1.3 Reading the V-I Curve**

-   Cut-in (knee) voltage: the forward voltage (~0.7V silicon, ~0.3V germanium) below which almost no current flows, and above which current rises sharply.
-   Reverse saturation current: the small, roughly constant current that flows under reverse bias before breakdown, caused by minority carriers.
-   Reverse breakdown voltage: the reverse voltage at which the diode suddenly conducts heavily in reverse, this is destructive for a normal diode, but is exploited intentionally in Zener diodes for voltage regulation.

## **1.4 Interview Q&A**

**Q: Why does forward biasing a diode reduce the depletion region width, while reverse biasing widens it?**

**A:** Forward bias pushes majority carriers (electrons from the n-side, holes from the p-side) toward the junction, where they recombine and shrink the depleted zone. Reverse bias pulls majority carriers away from the junction, widening the region left with no carriers to conduct.

**Q: Why is there a cut-in voltage before the diode conducts significantly, rather than conducting at any positive voltage?**

**A:** The built-in barrier potential at the junction (from the depletion region's internal electric field) must first be overcome by the externally applied forward voltage before carriers can cross the junction in meaningful numbers, below this point only a negligible current flows.

**Q: What causes the small reverse leakage current, if the depletion region blocks majority carriers?**

**A:** Minority carriers (a small number of electrons in the p-side and holes in the n-side, present due to thermal generation) are actually assisted across the junction by the reverse bias field, producing a small, roughly constant reverse saturation current, largely independent of the reverse voltage magnitude until breakdown.

## **1.5 Tips and tricks**

-   This topic typically carries the most marks (noted 7-8 in the syllabus), make sure you can draw the V-I curve from memory, labelling cut-in voltage, reverse saturation current, and breakdown voltage without hesitation.
-   Always state the approximate cut-in voltages for silicon (0.7V) and germanium (0.3V), this number is used constantly in every downstream circuit calculation (rectifiers, clippers, clampers).
