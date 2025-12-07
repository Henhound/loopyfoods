// Placeholder kid registry for UI scaffolding

export type KidFoodType = 'sweet' | 'meat' | 'veggie' | 'starch' | 'gross'

export type PlaceholderKid = {
  title: string
  foodType: KidFoodType
  image: string
}

const sprite = (index: number) =>
  new URL(`../assets/sprites/kids/kid-${String(index).padStart(2, '0')}.png`, import.meta.url).href

export const PLACEHOLDER_KIDS: PlaceholderKid[] = [
  { title: 'Sunny Skye', foodType: 'sweet', image: sprite(1) },
  { title: 'Art Show Ava', foodType: 'veggie', image: sprite(2) },
  { title: 'Stacker Seth', foodType: 'starch', image: sprite(3) },
  { title: 'Scooter Sage', foodType: 'meat', image: sprite(4) },
  { title: 'Beachy Beau', foodType: 'gross', image: sprite(5) },
  { title: 'Rainbow Remy', foodType: 'sweet', image: sprite(6) },
  { title: 'Garden Gia', foodType: 'veggie', image: sprite(7) },
  { title: 'Bookworm Bree', foodType: 'veggie', image: sprite(8) },
  { title: 'Sidekick Samir', foodType: 'gross', image: sprite(9) },
  { title: 'Flower Fin', foodType: 'veggie', image: sprite(10) },
  { title: 'Twirl Talia', foodType: 'sweet', image: sprite(11) },
  { title: 'Maple May', foodType: 'sweet', image: sprite(12) },
  { title: 'Kite Kiki', foodType: 'veggie', image: sprite(13) },
  { title: 'Heroic Hugo', foodType: 'veggie', image: sprite(14) },
  { title: 'Hula Holly', foodType: 'meat', image: sprite(15) },
  { title: 'Backpack Bee', foodType: 'starch', image: sprite(16) },
  { title: 'Beatbox Bella', foodType: 'starch', image: sprite(17) },
  { title: 'Parka Pax', foodType: 'gross', image: sprite(18) },
  { title: 'Mic Drop Miri', foodType: 'gross', image: sprite(19) },
  { title: 'Cookie Coco', foodType: 'sweet', image: sprite(20) },
  { title: 'Star Scout Sol', foodType: 'starch', image: sprite(21) },
  { title: 'Blossom Bea', foodType: 'sweet', image: sprite(22) },
  { title: 'Crown Casey', foodType: 'meat', image: sprite(23) },
  { title: 'Winged Wren', foodType: 'meat', image: sprite(24) },
  { title: 'Mic Check Milo', foodType: 'gross', image: sprite(25) },
  { title: 'Builder Bay', foodType: 'starch', image: sprite(26) },
  { title: 'Trail Scout Tex', foodType: 'starch', image: sprite(27) },
  { title: 'Camera Cami', foodType: 'meat', image: sprite(28) },
  { title: 'Ranch Rider Rio', foodType: 'meat', image: sprite(29) },
  { title: 'Photo Finn', foodType: 'gross', image: sprite(30) },
]
