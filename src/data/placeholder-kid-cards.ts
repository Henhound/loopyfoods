// Placeholder kid registry for UI scaffolding

export type PlaceholderKid = {
  title: string
  description: string
  image: string
}

const sprite = (index: number) =>
  new URL(`../assets/sprites/kids/kid-${String(index).padStart(2, '0')}.png`, import.meta.url)
    .href

export const PLACEHOLDER_KIDS: PlaceholderKid[] = [
  { title: 'Sunny Skye', description: 'Draws sunshine on every lunch note.', image: sprite(1) },
  { title: 'Art Show Ava', description: 'Trades sketches for snack swaps.', image: sprite(2) },
  { title: 'Stacker Seth', description: 'Builds book towers between bites.', image: sprite(3) },
  { title: 'Scooter Sage', description: 'Rolls up fast when soup is served.', image: sprite(4) },
  { title: 'Beachy Beau', description: 'Brings a beach ball to every table.', image: sprite(5) },
  { title: 'Rainbow Remy', description: 'Adds color to every cafeteria corner.', image: sprite(6) },
  { title: 'Garden Gia', description: 'Picks flowers for the best trays.', image: sprite(7) },
  { title: 'Bookworm Bree', description: 'Reads menus like mystery novels.', image: sprite(8) },
  { title: 'Sidekick Samir', description: 'Backup dancer for lunchtime jams.', image: sprite(9) },
  { title: 'Flower Fin', description: 'Gives blooms to the lunch heroes.', image: sprite(10) },
  { title: 'Twirl Talia', description: 'Spins to celebrate spice combos.', image: sprite(11) },
  { title: 'Maple May', description: 'Follows the aroma map to dessert.', image: sprite(12) },
  { title: 'Kite Kiki', description: 'Catches breezes outside the café.', image: sprite(13) },
  { title: 'Heroic Hugo', description: 'Shouts “pow!” when flavors clash.', image: sprite(14) },
  { title: 'Hula Holly', description: 'Keeps rhythm with a ring of snacks.', image: sprite(15) },
  { title: 'Backpack Bee', description: 'Carries extra napkins for friends.', image: sprite(16) },
  { title: 'Beatbox Bella', description: 'Drops snack-time sound effects.', image: sprite(17) },
  { title: 'Parka Pax', description: 'Thinks every lunch is a snow day.', image: sprite(18) },
  { title: 'Mic Drop Miri', description: 'Announces the daily specials.', image: sprite(19) },
  { title: 'Cookie Coco', description: 'Bakes bonus treats on Tuesdays.', image: sprite(20) },
  { title: 'Star Scout Sol', description: 'Guides trays like a shooting star.', image: sprite(21) },
  { title: 'Blossom Bea', description: 'Delivers bouquets with hot cocoa.', image: sprite(22) },
  { title: 'Crown Casey', description: 'Declared royal taster of sauces.', image: sprite(23) },
  { title: 'Winged Wren', description: 'Glides from table to table.', image: sprite(24) },
  { title: 'Mic Check Milo', description: 'Tests acoustics with every sip.', image: sprite(25) },
  { title: 'Builder Bay', description: 'Stacks milk cartons into castles.', image: sprite(26) },
  { title: 'Trail Scout Tex', description: 'Snaps photos of perfect plates.', image: sprite(27) },
  { title: 'Camera Cami', description: 'Captures crumbs for posterity.', image: sprite(28) },
  { title: 'Ranch Rider Rio', description: 'Lassos fries with dipping sauce.', image: sprite(29) },
  { title: 'Photo Finn', description: 'Keeps a gallery of favorite bites.', image: sprite(30) },
]
