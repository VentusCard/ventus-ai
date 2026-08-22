# Drop the duplicated header in the expanded signal panel

The expanded drawer repeats what the card above already shows: family chip, customer count, 24h delta, sparkline, and the strong/likely/emerging confidence split plus bar. Remove that duplication.

## Changes (`SignalFamilyPanel.tsx`)

- Remove the tinted header block: family chip, big customer number, delta, sparkline, and the confidence summary line.
- Remove the standalone confidence bar row underneath it (also duplicated from the card).
- Keep a single slim top row: the short hint "Click any signal to open that segment in Customers" on the left and the close (X) button on the right.
- Signal tiles and the fixed double-height scroll body stay exactly as they are.

Net effect: the drawer opens straight into the signals grid, with the card above remaining the only place the family's headline numbers appear.
