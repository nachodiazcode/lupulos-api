import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Beer from '../src/models/Beer.js';
import Post from '../src/models/Post.js';
import Comment from '../src/models/Comment.js';
import Place from '../src/models/Place.js';
import Chat from '../src/models/Chat.js';
import Message from '../src/models/Message.js';

const DEMO_PASSWORD = 'demo1234';

/* ═══════════════════════════════════════════
   USERS  (~15 perfiles variados)
═══════════════════════════════════════════ */

const demoUsers = [
  {
    key: 'demo',
    username: 'demo.lupulos',
    email: 'demo@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Amante de las cervezas artesanales y explorador de nuevos estilos. Fundador de Lúpulos App 🍺',
    city: 'Pichilemu',
    country: 'Chile',
    favoriteStyle: 'Golden Ale',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Demo+Lupulos&background=F59E0B&color=fff',
    plan: 'explorer',
    role: 'owner',
  },
  {
    key: 'cata',
    username: 'cata.cervecera',
    email: 'cata@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Sommelier cervecera certificada. Organizo catas y eventos en Santiago 🍻',
    city: 'Santiago',
    country: 'Chile',
    favoriteStyle: 'Belgian Tripel',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Cata+Cervecera&background=8B5CF6&color=fff',
    plan: 'pro',
  },
  {
    key: 'fan',
    username: 'lupulos.fan',
    email: 'fan@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Siempre en busca de nuevas cervezas y buenos lugares. IPA lover 🌿',
    city: 'Santiago',
    country: 'Chile',
    favoriteStyle: 'IPA',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Lupulos+Fan&background=10B981&color=fff',
    plan: 'lupuloso',
  },
  {
    key: 'bartender',
    username: 'bartender.ruta',
    email: 'bartender@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Bar y maridajes: recomendaciones reales y honestas. 12 años en la barra 🥂',
    city: 'Valparaíso',
    country: 'Chile',
    favoriteStyle: 'Stout',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Bartender+Ruta&background=EF4444&color=fff',
    plan: 'pro',
  },
  {
    key: 'maite',
    username: 'maite.hophead',
    email: 'maite@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Ingeniera de día, cervecera de noche. Homebrew desde 2019 🏠🍺',
    city: 'Concepción',
    country: 'Chile',
    favoriteStyle: 'Pale Ale',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Maite+H&background=EC4899&color=fff',
    plan: 'lupuloso',
  },
  {
    key: 'rodrigo',
    username: 'rodrigo.brew',
    email: 'rodrigo@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Cervecero artesanal en Valdivia. Dueño de @cerveceriadelsur. Amante del lúpulo 🌲',
    city: 'Valdivia',
    country: 'Chile',
    favoriteStyle: 'West Coast IPA',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Rodrigo+B&background=3B82F6&color=fff',
    plan: 'pro',
  },
  {
    key: 'pame',
    username: 'pame.stout',
    email: 'pame@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Stout y Porter son mi mundo oscuro. Fotógrafa gastronómica 📸🍫',
    city: 'Santiago',
    country: 'Chile',
    favoriteStyle: 'Imperial Stout',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Pame+S&background=1F2937&color=fff',
    plan: 'lupuloso',
  },
  {
    key: 'diego',
    username: 'diego.lager',
    email: 'diego@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'No todo es IPA. Defensor de las lagers artesanales y cervezas sessionables 🍋',
    city: 'Viña del Mar',
    country: 'Chile',
    favoriteStyle: 'Czech Pilsner',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Diego+L&background=FBBF24&color=000',
    plan: 'free',
  },
  {
    key: 'sofi',
    username: 'sofi.maltera',
    email: 'sofi@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Periodista y blogger cervecera. Escribo sobre cultura cervecera chilena ✍️🍺',
    city: 'Santiago',
    country: 'Chile',
    favoriteStyle: 'Amber Ale',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Sofi+M&background=F97316&color=fff',
    plan: 'explorer',
  },
  {
    key: 'tomas',
    username: 'tomas.lupulo',
    email: 'tomas@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Recorriendo Chile bar a bar. +200 cervezas catadas este año 🗺️',
    city: 'Puerto Varas',
    country: 'Chile',
    favoriteStyle: 'Hazy IPA',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Tomas+L&background=06B6D4&color=fff',
    plan: 'lupuloso',
  },
  {
    key: 'vale',
    username: 'vale.craft',
    email: 'vale@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Diseñadora y cervecera casual. Me encantan las sour y las fruit beer 🍓',
    city: 'La Serena',
    country: 'Chile',
    favoriteStyle: 'Berliner Weisse',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Vale+C&background=A78BFA&color=fff',
    plan: 'free',
  },
  {
    key: 'nicolas',
    username: 'nico.brewmaster',
    email: 'nico@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Brewmaster en Cervecería Granizo. Haciendo birra desde los 22 🏭',
    city: 'Santiago',
    country: 'Chile',
    favoriteStyle: 'Double IPA',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Nico+BM&background=059669&color=fff',
    plan: 'pro',
  },
  {
    key: 'fran',
    username: 'fran.cervezas',
    email: 'fran@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Chef y amante del maridaje cerveza + comida. Recetas y tips en mi perfil 🧑‍🍳',
    city: 'Valparaíso',
    country: 'Chile',
    favoriteStyle: 'Saison',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Fran+C&background=DC2626&color=fff',
    plan: 'lupuloso',
  },
  {
    key: 'andres',
    username: 'andres.pinta',
    email: 'andres@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Coleccionista de latas y etiquetas. Más de 500 en mi colección 🎨',
    city: 'Temuco',
    country: 'Chile',
    favoriteStyle: 'Red Ale',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Andres+P&background=7C3AED&color=fff',
    plan: 'free',
  },
  {
    key: 'caro',
    username: 'caro.hoppy',
    email: 'caro@lupulos.app',
    password: DEMO_PASSWORD,
    bio: 'Veterinaria de profesión, lupulómana de corazón. Pet-friendly bars FTW 🐕🍺',
    city: 'Santiago',
    country: 'Chile',
    favoriteStyle: 'Session IPA',
    isVerified: true,
    profilePicture: 'https://ui-avatars.com/api/?name=Caro+H&background=F472B6&color=fff',
    plan: 'free',
  },
];

/* ═══════════════════════════════════════════
   BEERS  (~20 cervezas artesanales chilenas)
═══════════════════════════════════════════ */

const demoBeers = [
  {
    name: 'Kross 5 Edición Especial',
    brewery: 'Kross',
    style: 'Strong Ale',
    abv: 7.2,
    description:
      'Cerveza de edición especial con notas a toffee, vainilla y caramelo. Cuerpo medio-alto y final suave.',
    image: '/uploads/beers/1747678660567-kross5.png',
    createdBy: 'demo@lupulos.app',
    likesBy: ['fan@lupulos.app', 'bartender@lupulos.app', 'cata@lupulos.app', 'pame@lupulos.app', 'sofi@lupulos.app'],
    reviews: [
      { by: 'cata@lupulos.app', comment: 'Increíble complejidad y un final muy redondo. De lo mejor de Kross.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'Excelente para maridar con carnes ahumadas.', rating: 4 },
      { by: 'sofi@lupulos.app', comment: 'Toffee y vainilla bien presentes. Cuerpo generoso.', rating: 5 },
      { by: 'fran@lupulos.app', comment: 'La maridé con costillas BBQ y fue un golazo.', rating: 4 },
    ],
  },
  {
    name: 'PILLÁN IPA',
    brewery: 'Cumbres del Ranco',
    style: 'IPA',
    abv: 5.1,
    description: 'IPA refrescante con amargor equilibrado y aroma cítrico marcado. Lúpulos del sur de Chile.',
    image: '/uploads/beers/1745594907248-pillan.png',
    createdBy: 'demo@lupulos.app',
    likesBy: ['fan@lupulos.app', 'tomas@lupulos.app', 'maite@lupulos.app', 'nico@lupulos.app'],
    reviews: [
      { by: 'fan@lupulos.app', comment: 'Aromática y fácil de tomar, buen balance.', rating: 4 },
      { by: 'tomas@lupulos.app', comment: 'De las mejores IPAs del sur. Cítrica sin ser agresiva.', rating: 4 },
      { by: 'nico@lupulos.app', comment: 'Buen dry hopping. Se nota el lúpulo fresco.', rating: 4 },
    ],
  },
  {
    name: 'KÜYEN',
    brewery: 'Cumbres del Ranco',
    style: 'Belgian Strong Ale',
    abv: 8.0,
    description: 'Ale belga de carácter especiado y frutal, dorado intenso y final seco.',
    image: '/uploads/beers/1745595022892-kuyen.png',
    createdBy: 'demo@lupulos.app',
    likesBy: ['fan@lupulos.app', 'bartender@lupulos.app', 'cata@lupulos.app', 'rodrigo@lupulos.app'],
    reviews: [
      { by: 'cata@lupulos.app', comment: 'Potente, especiada y muy bien lograda. Nivel europeo.', rating: 5 },
      { by: 'fan@lupulos.app', comment: 'Me gustó el final seco, bien balanceada.', rating: 4 },
      { by: 'rodrigo@lupulos.app', comment: 'Una joya escondida del sur. Levadura belga de verdad.', rating: 5 },
    ],
  },
  {
    name: 'Kunstmann Torobayo',
    brewery: 'Kunstmann',
    style: 'Lager',
    abv: 5.0,
    description: 'Lager dorada de Valdivia con cuerpo liviano, malta pilsner y un final limpio y refrescante.',
    createdBy: 'rodrigo@lupulos.app',
    likesBy: ['diego@lupulos.app', 'demo@lupulos.app', 'vale@lupulos.app', 'andres@lupulos.app', 'caro@lupulos.app'],
    reviews: [
      { by: 'diego@lupulos.app', comment: 'La lager perfecta para un día de calor. Limpia y precisa.', rating: 5 },
      { by: 'demo@lupulos.app', comment: 'Un clásico que nunca falla. Siempre consistente.', rating: 4 },
      { by: 'vale@lupulos.app', comment: 'Suave y fácil. Mi puerta de entrada al craft.', rating: 4 },
    ],
  },
  {
    name: 'Szot Amber Ale',
    brewery: 'Szot',
    style: 'Amber Ale',
    abv: 5.5,
    description: 'Amber ale con notas a caramelo y tostado, cuerpo medio y amargor moderado. Un clásico chileno.',
    createdBy: 'cata@lupulos.app',
    likesBy: ['sofi@lupulos.app', 'fran@lupulos.app', 'bartender@lupulos.app', 'andres@lupulos.app'],
    reviews: [
      { by: 'sofi@lupulos.app', comment: 'La Szot Amber es de mis favoritas. Caramelo perfecto.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'Va con todo. Hamburguesas, pizza, lo que sea.', rating: 4 },
      { by: 'andres@lupulos.app', comment: 'Etiqueta icónica y cerveza a la altura.', rating: 4 },
    ],
  },
  {
    name: 'Jester Hazy Queen',
    brewery: 'Jester',
    style: 'Hazy IPA',
    abv: 6.5,
    description: 'New England IPA turbia con explosión de maracuyá, mango y piña. Suave en boca, jugosa.',
    createdBy: 'nico@lupulos.app',
    likesBy: ['tomas@lupulos.app', 'fan@lupulos.app', 'maite@lupulos.app', 'vale@lupulos.app', 'caro@lupulos.app', 'demo@lupulos.app'],
    reviews: [
      { by: 'tomas@lupulos.app', comment: 'Jugo de lúpulo puro. Tropical y cremosa. Adictiva.', rating: 5 },
      { by: 'fan@lupulos.app', comment: 'De las mejores hazy de Chile sin duda.', rating: 5 },
      { by: 'maite@lupulos.app', comment: 'Me voló la cabeza. Mango y maracuyá increíbles.', rating: 5 },
      { by: 'vale@lupulos.app', comment: 'No parece cerveza de lo frutal que es. Me encantó.', rating: 4 },
    ],
  },
  {
    name: 'Granizo Stout',
    brewery: 'Granizo',
    style: 'Dry Stout',
    abv: 4.8,
    description: 'Stout seca con notas a café tostado y chocolate amargo. Cuerpo medio, final limpio.',
    createdBy: 'nico@lupulos.app',
    likesBy: ['pame@lupulos.app', 'bartender@lupulos.app', 'fran@lupulos.app', 'cata@lupulos.app'],
    reviews: [
      { by: 'pame@lupulos.app', comment: 'Café y chocolate en perfecto equilibrio. Mi estilo de vida.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'Sessionable y con carácter. Para tomar varias.', rating: 4 },
      { by: 'fran@lupulos.app', comment: 'Va increíble con un brownie de chocolate negro.', rating: 4 },
    ],
  },
  {
    name: 'Tubinger Hefeweizen',
    brewery: 'Tubinger',
    style: 'Hefeweizen',
    abv: 5.2,
    description: 'Cerveza de trigo alemana con notas a banana y clavo de olor. Turbia, refrescante y aromática.',
    createdBy: 'cata@lupulos.app',
    likesBy: ['diego@lupulos.app', 'vale@lupulos.app', 'caro@lupulos.app', 'demo@lupulos.app'],
    reviews: [
      { by: 'diego@lupulos.app', comment: 'La mejor hefeweizen chilena. Banana y clavo perfectos.', rating: 5 },
      { by: 'vale@lupulos.app', comment: 'Suavecita y refrescante. Ideal para verano.', rating: 4 },
      { by: 'caro@lupulos.app', comment: 'Se toma como agua en un día de calor.', rating: 4 },
    ],
  },
  {
    name: 'Del Puerto Porter',
    brewery: 'Cervecería Del Puerto',
    style: 'Robust Porter',
    abv: 5.8,
    description: 'Porter robusta de Valparaíso con notas a cacao, nuez y un toque ahumado sutil.',
    createdBy: 'bartender@lupulos.app',
    likesBy: ['pame@lupulos.app', 'rodrigo@lupulos.app', 'sofi@lupulos.app', 'fran@lupulos.app'],
    reviews: [
      { by: 'pame@lupulos.app', comment: 'Oscuridad deliciosa. El toque ahumado la hace única.', rating: 5 },
      { by: 'rodrigo@lupulos.app', comment: 'Porteña con personalidad. Muy bien lograda.', rating: 4 },
      { by: 'sofi@lupulos.app', comment: 'Me sorprendió. El cacao se siente muy natural.', rating: 4 },
    ],
  },
  {
    name: 'Kross Lupulus',
    brewery: 'Kross',
    style: 'APA',
    abv: 5.0,
    description: 'American Pale Ale con lúpulos americanos. Cítrica, floral y perfectamente balanceada.',
    createdBy: 'demo@lupulos.app',
    likesBy: ['fan@lupulos.app', 'maite@lupulos.app', 'tomas@lupulos.app', 'caro@lupulos.app', 'nico@lupulos.app'],
    reviews: [
      { by: 'fan@lupulos.app', comment: 'Mi cerveza del día a día. Nunca me aburre.', rating: 4 },
      { by: 'maite@lupulos.app', comment: 'Balance perfecto entre malta y lúpulo.', rating: 4 },
      { by: 'tomas@lupulos.app', comment: 'La APA que le recomiendo a todos los que empiezan.', rating: 4 },
    ],
  },
  {
    name: 'Jester King of Darkness',
    brewery: 'Jester',
    style: 'Imperial Stout',
    abv: 10.5,
    description: 'Imperial stout envejecida en barricas de bourbon. Chocolate, vainilla, café y caramelo quemado.',
    createdBy: 'nico@lupulos.app',
    likesBy: ['pame@lupulos.app', 'cata@lupulos.app', 'bartender@lupulos.app', 'rodrigo@lupulos.app', 'sofi@lupulos.app'],
    reviews: [
      { by: 'pame@lupulos.app', comment: 'Esto es otra liga. Bourbon, chocolate, vainilla... perfecta.', rating: 5 },
      { by: 'cata@lupulos.app', comment: 'La mejor imperial stout chilena que he probado.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'Para saborear lento. Un postre líquido.', rating: 5 },
      { by: 'rodrigo@lupulos.app', comment: 'La barrica le da una complejidad brutal.', rating: 5 },
    ],
  },
  {
    name: 'Volcanes del Sur Pilsner',
    brewery: 'Volcanes del Sur',
    style: 'Czech Pilsner',
    abv: 4.5,
    description: 'Pilsner bohemia con agua del volcán Villarrica. Maltosa, dorada y con un amargor floral delicado.',
    createdBy: 'rodrigo@lupulos.app',
    likesBy: ['diego@lupulos.app', 'demo@lupulos.app', 'andres@lupulos.app', 'vale@lupulos.app'],
    reviews: [
      { by: 'diego@lupulos.app', comment: 'Pilsner de manual. El agua volcánica se nota.', rating: 5 },
      { by: 'andres@lupulos.app', comment: 'Limpia, crujiente, perfecta. La etiqueta también es hermosa.', rating: 4 },
      { by: 'demo@lupulos.app', comment: 'Del sur con orgullo. Sutil y elegante.', rating: 4 },
    ],
  },
  {
    name: 'Bundor Red Ale',
    brewery: 'Bundor',
    style: 'Irish Red Ale',
    abv: 5.0,
    description: 'Red ale de inspiración irlandesa hecha en Valdivia. Malta caramelo, tostado suave y final seco.',
    createdBy: 'rodrigo@lupulos.app',
    likesBy: ['andres@lupulos.app', 'sofi@lupulos.app', 'fran@lupulos.app'],
    reviews: [
      { by: 'andres@lupulos.app', comment: 'Roja preciosa y sabor honesto. Me recordó a Irlanda.', rating: 4 },
      { by: 'sofi@lupulos.app', comment: 'Maltosa y reconfortante. Perfecta para otoño.', rating: 4 },
    ],
  },
  {
    name: 'Guayacán Sour Frambuesa',
    brewery: 'Guayacán',
    style: 'Berliner Weisse',
    abv: 3.8,
    description: 'Sour ale con frambuesas del Valle del Elqui. Ácida, frutal y ultra refrescante.',
    createdBy: 'vale@lupulos.app',
    likesBy: ['caro@lupulos.app', 'maite@lupulos.app', 'vale@lupulos.app', 'cata@lupulos.app', 'demo@lupulos.app'],
    reviews: [
      { by: 'caro@lupulos.app', comment: 'Esto no parece cerveza, parece jugo de frambuesa mágico.', rating: 5 },
      { by: 'maite@lupulos.app', comment: 'La acidez justa. Perfecta para un aperitivo.', rating: 4 },
      { by: 'cata@lupulos.app', comment: 'Excelente gateway beer. La recomiendo a quien no le gusta la cerveza.', rating: 4 },
    ],
  },
  {
    name: 'Szot Barley Wine',
    brewery: 'Szot',
    style: 'Barley Wine',
    abv: 9.5,
    description: 'Barley wine añejada con notas a frutos secos, miel, pan tostado y un calor alcohólico elegante.',
    createdBy: 'cata@lupulos.app',
    likesBy: ['bartender@lupulos.app', 'nico@lupulos.app', 'rodrigo@lupulos.app'],
    reviews: [
      { by: 'bartender@lupulos.app', comment: 'Para tomar en copa de vino, con calma y buena compañía.', rating: 5 },
      { by: 'nico@lupulos.app', comment: 'Complejidad enorme. Se nota el añejamiento.', rating: 4 },
      { by: 'rodrigo@lupulos.app', comment: 'Szot siempre sorprende con sus ediciones especiales.', rating: 4 },
    ],
  },
  {
    name: 'Kross Maibock',
    brewery: 'Kross',
    style: 'Maibock',
    abv: 6.5,
    description: 'Bock de primavera con malta tostada, cuerpo robusto y carácter maltoso dulce.',
    createdBy: 'demo@lupulos.app',
    likesBy: ['diego@lupulos.app', 'bartender@lupulos.app', 'sofi@lupulos.app', 'andres@lupulos.app'],
    reviews: [
      { by: 'diego@lupulos.app', comment: 'Maltosa, potente y elegante. Kross sabe hacer lagers.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'Excelente con platos invernales. Estofados, guisos.', rating: 4 },
      { by: 'sofi@lupulos.app', comment: 'Me sorprendió gratamente. No es el estilo que tomo siempre pero esta es especial.', rating: 4 },
    ],
  },
  {
    name: 'Jester Session IPA',
    brewery: 'Jester',
    style: 'Session IPA',
    abv: 4.2,
    description: 'Session IPA ligera, tropical y peligrosamente fácil de tomar. Baja graduación, mucho sabor.',
    createdBy: 'nico@lupulos.app',
    likesBy: ['caro@lupulos.app', 'fan@lupulos.app', 'tomas@lupulos.app', 'maite@lupulos.app', 'vale@lupulos.app', 'demo@lupulos.app'],
    reviews: [
      { by: 'caro@lupulos.app', comment: 'Mi cerveza de verano oficial. Se puede tomar todo el día.', rating: 5 },
      { by: 'fan@lupulos.app', comment: 'Todo el sabor de una IPA sin la resaca. Genial.', rating: 4 },
      { by: 'tomas@lupulos.app', comment: 'Perfecta para el carrete. Rica y liviana.', rating: 4 },
    ],
  },
  {
    name: 'Cervecería Del Sur West Coast IPA',
    brewery: 'Cervecería Del Sur',
    style: 'West Coast IPA',
    abv: 6.8,
    description: 'West Coast IPA cristalina con pinosidad, pomelo y un amargor firme pero limpio.',
    createdBy: 'rodrigo@lupulos.app',
    likesBy: ['fan@lupulos.app', 'nico@lupulos.app', 'tomas@lupulos.app', 'maite@lupulos.app'],
    reviews: [
      { by: 'fan@lupulos.app', comment: 'West Coast como debe ser. Amarga, limpia, adictiva.', rating: 5 },
      { by: 'nico@lupulos.app', comment: 'Pino y pomelo bien logrados. La bebería todos los días.', rating: 4 },
      { by: 'maite@lupulos.app', comment: 'Cristalina y potente. Del sur con mucha calidad.', rating: 4 },
    ],
  },
  {
    name: 'Guayacán Golden Ale',
    brewery: 'Guayacán',
    style: 'Golden Ale',
    abv: 4.5,
    description: 'Golden ale del Valle del Elqui. Dorada, suave, con notas a miel y pan blanco.',
    createdBy: 'vale@lupulos.app',
    likesBy: ['demo@lupulos.app', 'diego@lupulos.app', 'caro@lupulos.app', 'andres@lupulos.app', 'vale@lupulos.app'],
    reviews: [
      { by: 'demo@lupulos.app', comment: 'Mi golden ale favorita de Chile. Miel sutil y muy drinkable.', rating: 5 },
      { by: 'diego@lupulos.app', comment: 'Simple, honesta y deliciosa. No necesita más.', rating: 4 },
      { by: 'caro@lupulos.app', comment: 'Perfecta para quien se inicia en el craft.', rating: 4 },
    ],
  },
  {
    name: 'Kunstmann Gran Torobayo',
    brewery: 'Kunstmann',
    style: 'Doppelbock',
    abv: 7.5,
    description: 'Doppelbock premium de Kunstmann. Caramelo oscuro, frutos secos, pan tostado y final cálido.',
    createdBy: 'rodrigo@lupulos.app',
    likesBy: ['cata@lupulos.app', 'bartender@lupulos.app', 'pame@lupulos.app', 'sofi@lupulos.app', 'fran@lupulos.app'],
    reviews: [
      { by: 'cata@lupulos.app', comment: 'Impresionante. Nivel de cervecerías alemanas centenarias.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'Cuerpo enorme y sabor complejo. Para noches frías.', rating: 5 },
      { by: 'pame@lupulos.app', comment: 'Caramelo oscuro y frutos secos. Me enamoré.', rating: 5 },
    ],
  },
];

/* ═══════════════════════════════════════════
   PLACES  (~8 lugares)
═══════════════════════════════════════════ */

const demoPlaces = [
  {
    name: 'Viejo Lobo Taproom',
    description: 'Taproom con vista al mar, variedad de estilos y comida local. El punto de encuentro cervecero de Pichilemu.',
    address: { street: 'Av. Punta de Lobos 123', city: 'Pichilemu', state: "O'Higgins", country: 'Chile', postalCode: '3220000' },
    phone: '+56 9 5555 1234',
    website: 'https://lupulos.app',
    contactEmail: 'hola@lupulos.app',
    coverImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1436076863939-06870fe779c2?auto=format&fit=crop&w=1200&q=80',
    ],
    beers: ['KÜYEN', 'PILLÁN IPA', 'Guayacán Golden Ale'],
    amenities: ['Terraza', 'Comida local', 'Eventos en vivo', 'WiFi'],
    openingHours: {
      monday: { open: '12:00', close: '22:00' }, tuesday: { open: '12:00', close: '22:00' },
      wednesday: { open: '12:00', close: '22:00' }, thursday: { open: '12:00', close: '22:00' },
      friday: { open: '12:00', close: '00:00' }, saturday: { open: '12:00', close: '00:00' },
      sunday: { open: '12:00', close: '20:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/lupulos.app', facebook: 'https://facebook.com/lupulosapp' },
    events: [
      { name: 'Cata guiada de estilos belgas', description: 'Cata con maridaje y explicación de estilos.', date: new Date('2026-03-08T20:00:00Z') },
      { name: 'Noche de trivia cervecera', description: 'Pon a prueba tus conocimientos lupulares. Premios para los ganadores.', date: new Date('2026-03-15T21:00:00Z') },
    ],
    promotions: [
      { description: 'Happy hour 2x1 de 18:00 a 20:00', discountPercent: 50, startDate: new Date('2026-02-01'), endDate: new Date('2026-04-30') },
    ],
    isPetFriendly: true, hasLiveMusic: true, hasTerrace: true, hasParking: false,
    owner: 'demo@lupulos.app',
    reviews: [
      { by: 'fan@lupulos.app', comment: 'Buen ambiente y gran selección. La terraza con vista al mar es espectacular.', rating: 5 },
      { by: 'bartender@lupulos.app', comment: 'La terraza es un plus. Volvería cada fin de semana.', rating: 4 },
      { by: 'tomas@lupulos.app', comment: 'Parada obligatoria en Pichilemu. Excelente selección de grifos.', rating: 5 },
      { by: 'caro@lupulos.app', comment: 'Pet-friendly y con buenas cervezas. No pido más.', rating: 5 },
    ],
  },
  {
    name: 'Bar Kross Santiago',
    description: 'Bar urbano con grifos rotativos y cocina simple para compartir. El taproom oficial de Kross en Providencia.',
    address: { street: 'Av. Providencia 987', city: 'Santiago', state: 'Metropolitana', country: 'Chile', postalCode: '7500000' },
    phone: '+56 2 2222 9876',
    website: 'https://lupulos.app',
    contactEmail: 'contacto@lupulos.app',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80'],
    beers: ['Kross 5 Edición Especial', 'Kross Lupulus', 'Kross Maibock'],
    amenities: ['Pantallas deportivas', 'Happy hour', 'Cocina hasta tarde'],
    openingHours: {
      monday: { open: '13:00', close: '23:00' }, tuesday: { open: '13:00', close: '23:00' },
      wednesday: { open: '13:00', close: '23:00' }, thursday: { open: '13:00', close: '23:59' },
      friday: { open: '13:00', close: '01:00' }, saturday: { open: '13:00', close: '01:00' },
      sunday: { open: '13:00', close: '22:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/krossbeer' },
    events: [
      { name: 'Lanzamiento Kross de temporada', description: 'Prueba en primicia la nueva cerveza estacional de Kross.', date: new Date('2026-03-20T19:00:00Z') },
    ],
    promotions: [
      { description: 'Promo almuerzo + pinta $6.990', discountPercent: 20, startDate: new Date('2026-02-15'), endDate: new Date('2026-05-15') },
    ],
    isPetFriendly: false, hasLiveMusic: false, hasTerrace: true, hasParking: true,
    owner: 'demo@lupulos.app',
    reviews: [
      { by: 'demo@lupulos.app', comment: 'Excelente servicio y buena variedad de Kross en grifo.', rating: 4 },
      { by: 'sofi@lupulos.app', comment: 'Siempre fresca, siempre rotando estilos. Me encanta.', rating: 5 },
      { by: 'pame@lupulos.app', comment: 'El ambiente es tranquilo y la cerveza impecable.', rating: 4 },
    ],
  },
  {
    name: 'Cervecería Kunstmann',
    description: 'La cervecería más emblemática de Valdivia. Restaurante con vista al río y planta cervecera visitable.',
    address: { street: 'Ruta T-350 Km 950', city: 'Valdivia', state: 'Los Ríos', country: 'Chile', postalCode: '5090000' },
    phone: '+56 63 229 2969',
    website: 'https://www.kunstmann.cl',
    contactEmail: 'info@kunstmann.cl',
    coverImage: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1200&q=80',
    ],
    beers: ['Kunstmann Torobayo', 'Kunstmann Gran Torobayo'],
    amenities: ['Restaurante', 'Tour cervecero', 'Tienda', 'Estacionamiento', 'Vista al río'],
    openingHours: {
      monday: { open: '12:00', close: '22:00' }, tuesday: { open: '12:00', close: '22:00' },
      wednesday: { open: '12:00', close: '22:00' }, thursday: { open: '12:00', close: '22:00' },
      friday: { open: '12:00', close: '23:00' }, saturday: { open: '12:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/cervezakunstmann', facebook: 'https://facebook.com/cervezakunstmann' },
    events: [
      { name: 'Tour cervecero + cata', description: 'Recorre la planta y termina con una cata de 5 estilos.', date: new Date('2026-03-01T15:00:00Z') },
    ],
    promotions: [],
    isPetFriendly: false, hasLiveMusic: true, hasTerrace: true, hasParking: true,
    owner: 'rodrigo@lupulos.app',
    reviews: [
      { by: 'rodrigo@lupulos.app', comment: 'La catedral de la cerveza en Chile. Hay que ir al menos una vez.', rating: 5 },
      { by: 'tomas@lupulos.app', comment: 'El tour es muy recomendable. Y la Gran Torobayo de grifo es otra cosa.', rating: 5 },
      { by: 'cata@lupulos.app', comment: 'Imprescindible si visitas Valdivia. El restaurante es excelente.', rating: 5 },
      { by: 'diego@lupulos.app', comment: 'Las lagers de grifo acá son las mejores de Chile.', rating: 5 },
    ],
  },
  {
    name: 'HopBar Bellavista',
    description: 'Bar de barrio con 16 grifos rotativos de cervecerías chilenas independientes. Terraza, buena música y cero pretensiones.',
    address: { street: 'Pío Nono 340', city: 'Santiago', state: 'Metropolitana', country: 'Chile', postalCode: '7500000' },
    phone: '+56 9 8765 4321',
    coverImage: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1575037614876-c38a4c44f5b8?auto=format&fit=crop&w=1200&q=80'],
    beers: ['Jester Hazy Queen', 'Jester Session IPA', 'Granizo Stout', 'Szot Amber Ale'],
    amenities: ['16 grifos', 'Terraza', 'DJ los viernes', 'WiFi', 'Snacks'],
    openingHours: {
      monday: { open: '', close: '' }, tuesday: { open: '18:00', close: '01:00' },
      wednesday: { open: '18:00', close: '01:00' }, thursday: { open: '18:00', close: '02:00' },
      friday: { open: '18:00', close: '03:00' }, saturday: { open: '16:00', close: '03:00' },
      sunday: { open: '16:00', close: '23:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/hopbar.cl' },
    events: [
      { name: 'Tap takeover Jester', description: 'Todos los grifos con cervezas de Jester por una noche.', date: new Date('2026-03-12T19:00:00Z') },
      { name: 'Viernes de vinilo y lúpulo', description: 'DJ con vinilos + cervezas colaborativas.', date: new Date('2026-03-07T20:00:00Z') },
    ],
    promotions: [
      { description: 'Pinta de bienvenida gratis con tu primera visita', discountPercent: 100, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') },
    ],
    isPetFriendly: true, hasLiveMusic: true, hasTerrace: true, hasParking: false,
    owner: 'nico@lupulos.app',
    reviews: [
      { by: 'fan@lupulos.app', comment: '16 grifos y todos buenos. El mejor bar de Bellavista para cerveza.', rating: 5 },
      { by: 'maite@lupulos.app', comment: 'El tap takeover de Jester fue increíble. Repitan por favor.', rating: 5 },
      { by: 'caro@lupulos.app', comment: 'Llevé a mi perra y la pasamos genial. Terraza amplia.', rating: 4 },
      { by: 'nico@lupulos.app', comment: 'Nuestro lugar favorito para probar cosas nuevas.', rating: 5 },
      { by: 'fran@lupulos.app', comment: 'Buena onda, buenos precios y cerveza de calidad. ¿Qué más?', rating: 4 },
    ],
  },
  {
    name: 'Cervecería del Puerto Taproom',
    description: 'Taproom de cervecería artesanal en los cerros de Valparaíso. Producción propia y vista al puerto.',
    address: { street: 'Cerro Alegre 456', city: 'Valparaíso', state: 'Valparaíso', country: 'Chile', postalCode: '2340000' },
    phone: '+56 32 222 3456',
    website: 'https://delpuerto.cl',
    coverImage: 'https://images.unsplash.com/photo-1555658636-6e4a36218be7?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80'],
    beers: ['Del Puerto Porter'],
    amenities: ['Producción a la vista', 'Terraza', 'Tabla de quesos', 'Vista al puerto'],
    openingHours: {
      monday: { open: '', close: '' }, tuesday: { open: '', close: '' },
      wednesday: { open: '17:00', close: '23:00' }, thursday: { open: '17:00', close: '23:00' },
      friday: { open: '16:00', close: '00:00' }, saturday: { open: '14:00', close: '00:00' },
      sunday: { open: '14:00', close: '21:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/delpuertocerveza' },
    events: [],
    promotions: [
      { description: 'Growler + relleno con 30% dcto', discountPercent: 30, startDate: new Date('2026-02-01'), endDate: new Date('2026-06-30') },
    ],
    isPetFriendly: true, hasLiveMusic: false, hasTerrace: true, hasParking: false,
    owner: 'bartender@lupulos.app',
    reviews: [
      { by: 'bartender@lupulos.app', comment: 'Mi taproom favorito en Valpo. La porter de grifo es imperdible.', rating: 5 },
      { by: 'fran@lupulos.app', comment: 'La tabla de quesos + porter = combinación perfecta.', rating: 5 },
      { by: 'sofi@lupulos.app', comment: 'Hermoso lugar, cerveza honesta y vista increíble.', rating: 4 },
    ],
  },
  {
    name: 'Lupulado Beer Garden',
    description: 'Beer garden al aire libre en el barrio Italia. Food trucks, cerveza artesanal y buen ambiente familiar.',
    address: { street: 'Av. Italia 1680', city: 'Santiago', state: 'Metropolitana', country: 'Chile', postalCode: '7500000' },
    phone: '+56 9 1111 2222',
    coverImage: 'https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
    ],
    beers: ['Guayacán Sour Frambuesa', 'Guayacán Golden Ale', 'Jester Session IPA', 'Szot Amber Ale'],
    amenities: ['Beer garden', 'Food trucks', 'Juegos de mesa', 'Familiar', 'WiFi', 'Espacio para niños'],
    openingHours: {
      monday: { open: '', close: '' }, tuesday: { open: '', close: '' },
      wednesday: { open: '17:00', close: '22:00' }, thursday: { open: '17:00', close: '22:00' },
      friday: { open: '16:00', close: '00:00' }, saturday: { open: '12:00', close: '00:00' },
      sunday: { open: '12:00', close: '21:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/lupulado.cl' },
    events: [
      { name: 'Festival de Sours', description: 'Más de 20 cervezas ácidas de todo Chile.', date: new Date('2026-04-05T14:00:00Z') },
    ],
    promotions: [
      { description: 'Domingos familiares: niños gratis + descuento en jarras', discountPercent: 15, startDate: new Date('2026-03-01'), endDate: new Date('2026-05-31') },
    ],
    isPetFriendly: true, hasLiveMusic: false, hasTerrace: true, hasParking: false,
    owner: 'cata@lupulos.app',
    reviews: [
      { by: 'vale@lupulos.app', comment: 'El mejor lugar para ir con amigos que no son cerveceros. Algo para todos.', rating: 5 },
      { by: 'caro@lupulos.app', comment: 'Food trucks + sour de frambuesa = domingo perfecto.', rating: 5 },
      { by: 'diego@lupulos.app', comment: 'Ambiente relajado y buena selección. El beer garden más lindo de Santiago.', rating: 4 },
      { by: 'demo@lupulos.app', comment: 'Gran lugar para llevar a quienes recién descubren el craft.', rating: 4 },
    ],
  },
  {
    name: 'Brewpub Patagonia Sur',
    description: 'Brewpub con cervecería propia en Puerto Varas. Cocina patagónica, vista al volcán Osorno y cervezas únicas.',
    address: { street: 'Av. Del Salvador 520', city: 'Puerto Varas', state: 'Los Lagos', country: 'Chile', postalCode: '5550000' },
    phone: '+56 65 223 1234',
    website: 'https://patagoniasur.cl',
    coverImage: 'https://images.unsplash.com/photo-1560840067-ddcaeb7831d2?auto=format&fit=crop&w=1200&q=80',
    gallery: ['https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=1200&q=80'],
    beers: ['Volcanes del Sur Pilsner'],
    amenities: ['Restaurante', 'Vista al volcán', 'Cervecería a la vista', 'Chimenea', 'Estacionamiento'],
    openingHours: {
      monday: { open: '12:00', close: '22:00' }, tuesday: { open: '12:00', close: '22:00' },
      wednesday: { open: '12:00', close: '22:00' }, thursday: { open: '12:00', close: '22:00' },
      friday: { open: '12:00', close: '23:00' }, saturday: { open: '12:00', close: '23:00' },
      sunday: { open: '12:00', close: '21:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/patagoniasur.brew' },
    events: [
      { name: 'Maridaje cerveza + cordero patagónico', description: 'Cena de 5 tiempos con cerveza en cada plato.', date: new Date('2026-03-22T20:00:00Z') },
    ],
    promotions: [],
    isPetFriendly: false, hasLiveMusic: true, hasTerrace: true, hasParking: true,
    owner: 'tomas@lupulos.app',
    reviews: [
      { by: 'tomas@lupulos.app', comment: 'Mi lugar favorito en el sur. Vista al Osorno + cerveza propia = paraíso.', rating: 5 },
      { by: 'rodrigo@lupulos.app', comment: 'La cocina patagónica acá es tan buena como la cerveza.', rating: 5 },
      { by: 'cata@lupulos.app', comment: 'El maridaje con cordero fue una experiencia memorable.', rating: 5 },
      { by: 'andres@lupulos.app', comment: 'Chimenea + stout + noche de lluvia = felicidad pura.', rating: 5 },
    ],
  },
  {
    name: 'La Esquina del Lúpulo',
    description: 'Botillería craft y bar de degustación en barrio Yungay. +300 etiquetas nacionales e importadas.',
    address: { street: 'Libertad 1050', city: 'Santiago', state: 'Metropolitana', country: 'Chile', postalCode: '8320000' },
    phone: '+56 9 3333 4444',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200&q=80',
    gallery: [],
    beers: ['Bundor Red Ale', 'Szot Barley Wine', 'Kross 5 Edición Especial', 'Jester King of Darkness'],
    amenities: ['Botillería', 'Degustación', 'Asesoría personalizada', 'Cervezas importadas'],
    openingHours: {
      monday: { open: '11:00', close: '21:00' }, tuesday: { open: '11:00', close: '21:00' },
      wednesday: { open: '11:00', close: '21:00' }, thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' }, saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '12:00', close: '20:00' },
    },
    socialLinks: { instagram: 'https://instagram.com/esquina.lupulo' },
    events: [
      { name: 'Cata vertical Jester', description: 'Prueba 4 añadas de King of Darkness.', date: new Date('2026-04-12T19:00:00Z') },
    ],
    promotions: [
      { description: 'Lleva 6, paga 5 en cervezas para llevar', discountPercent: 17, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') },
    ],
    isPetFriendly: false, hasLiveMusic: false, hasTerrace: false, hasParking: false,
    owner: 'sofi@lupulos.app',
    reviews: [
      { by: 'andres@lupulos.app', comment: 'El paraíso del coleccionista. 300+ etiquetas no es broma.', rating: 5 },
      { by: 'pame@lupulos.app', comment: 'Encontré cervezas que no se consiguen en ningún otro lado.', rating: 5 },
      { by: 'nico@lupulos.app', comment: 'La asesoría es lo mejor. Te recomiendan según tus gustos.', rating: 4 },
      { by: 'cata@lupulos.app', comment: 'Un tesoro escondido en Yungay. Imprescindible.', rating: 5 },
    ],
  },
];

/* ═══════════════════════════════════════════
   POSTS  (~15 publicaciones variadas)
═══════════════════════════════════════════ */

const demoPosts = [
  {
    authorEmail: 'demo@lupulos.app',
    title: 'Cata: Kross 5 Edición Especial',
    content: 'Una cerveza compleja, con notas dulces y un final cálido. Ideal para tomarla con calma en una noche fría. Toffee, vainilla y un toque de caramelo que la hace irresistible.',
    images: ['/uploads/beers/1747678660567-kross5.png'],
    reactions: { like: ['demo@lupulos.app', 'fan@lupulos.app', 'cata@lupulos.app', 'pame@lupulos.app'], cheers: ['bartender@lupulos.app', 'sofi@lupulos.app'], recommended: ['fan@lupulos.app', 'fran@lupulos.app'] },
    comments: [
      { by: 'fan@lupulos.app', content: 'Buenísima, la probé el fin de semana y me sorprendió.' },
      { by: 'bartender@lupulos.app', content: 'La recomiendo con quesos maduros o costillas BBQ.' },
      { by: 'cata@lupulos.app', content: 'De las mejores ediciones especiales que ha sacado Kross.' },
    ],
  },
  {
    authorEmail: 'demo@lupulos.app',
    title: 'Ruta cervecera en Pichilemu',
    content: 'Les dejo mis paradas favoritas para una tarde de cerveza y mar: taprooms, playas y buena comida. Pichilemu tiene una escena craft que está creciendo mucho.',
    images: [],
    reactions: { like: ['fan@lupulos.app', 'tomas@lupulos.app', 'sofi@lupulos.app'], cheers: ['demo@lupulos.app', 'caro@lupulos.app'], recommended: ['bartender@lupulos.app'] },
    comments: [
      { by: 'bartender@lupulos.app', content: 'Muy buena ruta, agregaría un barcito en Punta de Lobos.' },
      { by: 'tomas@lupulos.app', content: 'Estuve en Pichilemu el verano pasado y confirmo todo. Imperdible.' },
      { by: 'vale@lupulos.app', content: '¿Recomendaciones para alguien que va por primera vez?' },
    ],
  },
  {
    authorEmail: 'fan@lupulos.app',
    title: 'Top 3 IPAs chilenas para el verano',
    content: 'Selección corta para refrescarse: cítricas, livianas y con buen aroma. 1) Jester Session IPA 2) Pillán IPA 3) Cervecería Del Sur West Coast. ¿Cuál agregarían?',
    images: ['/uploads/beers/1745594907248-pillan.png'],
    reactions: { like: ['demo@lupulos.app', 'bartender@lupulos.app', 'maite@lupulos.app', 'nico@lupulos.app', 'tomas@lupulos.app'], cheers: ['fan@lupulos.app', 'caro@lupulos.app'] },
    comments: [
      { by: 'maite@lupulos.app', content: '¡Necesito más recomendaciones así! Agregaría la Kross Lupulus.' },
      { by: 'nico@lupulos.app', content: 'La Hazy Queen de Jester también merece estar ahí.' },
      { by: 'rodrigo@lupulos.app', content: 'La Del Sur West Coast es increíble. Buen gusto.' },
      { by: 'caro@lupulos.app', content: 'Session IPA de Jester es mi cerveza oficial de verano.' },
    ],
  },
  {
    authorEmail: 'cata@lupulos.app',
    title: 'Guía de maridaje: cerveza + queso',
    content: 'El maridaje cerveza-queso es tan bueno o mejor que el de vino. Mis combos favoritos: Stout + queso azul, Hefeweizen + brie, IPA + cheddar añejo, Sour + queso de cabra. ¡Pruébenlos!',
    images: [],
    reactions: { like: ['fran@lupulos.app', 'bartender@lupulos.app', 'sofi@lupulos.app', 'pame@lupulos.app', 'demo@lupulos.app'], cheers: ['cata@lupulos.app'], recommended: ['fran@lupulos.app', 'bartender@lupulos.app', 'sofi@lupulos.app'] },
    comments: [
      { by: 'fran@lupulos.app', content: 'Como chef apruebo cada una de estas combinaciones. El stout + azul es de otro planeta.' },
      { by: 'bartender@lupulos.app', content: 'Agregaría Porter + gouda ahumado. Funciona increíble.' },
      { by: 'pame@lupulos.app', content: 'Voy a probar el de sour + queso de cabra este fin de semana.' },
      { by: 'vale@lupulos.app', content: 'Me encanta este tipo de contenido. ¡Más guías así por favor!' },
    ],
  },
  {
    authorEmail: 'pame@lupulos.app',
    title: 'Fotografía cervecera: tips para principiantes',
    content: 'Quieren mejorar sus fotos de cervezas? Luz natural siempre, fondo simple, gotas de condensación y un ángulo bajo hacen la diferencia. Compartan sus mejores fotos en los comentarios!',
    images: [],
    reactions: { like: ['vale@lupulos.app', 'sofi@lupulos.app', 'demo@lupulos.app', 'andres@lupulos.app'], cheers: ['pame@lupulos.app'] },
    comments: [
      { by: 'vale@lupulos.app', content: 'Buenísimos tips. Yo uso mi celu nomás pero con luz natural cambia todo.' },
      { by: 'sofi@lupulos.app', content: 'Como blogger puedo confirmar: la luz natural es el 80% de la foto.' },
      { by: 'andres@lupulos.app', content: 'Para las latas y etiquetas, ¿algún tip especial?' },
    ],
  },
  {
    authorEmail: 'rodrigo@lupulos.app',
    title: 'El sur de Chile: paraíso cervecero',
    content: 'Valdivia, Puerto Varas, Frutillar... el sur tiene una densidad de cervecerías artesanales increíble. El agua pura, el clima y la tradición alemana hacen que las lagers y bocks del sur sean de clase mundial.',
    images: [],
    reactions: { like: ['tomas@lupulos.app', 'demo@lupulos.app', 'cata@lupulos.app', 'diego@lupulos.app', 'andres@lupulos.app', 'sofi@lupulos.app'], cheers: ['rodrigo@lupulos.app', 'tomas@lupulos.app'], recommended: ['cata@lupulos.app', 'demo@lupulos.app'] },
    comments: [
      { by: 'tomas@lupulos.app', content: 'Vivo en Puerto Varas y confirmo. Cada esquina tiene una cervecería.' },
      { by: 'cata@lupulos.app', content: 'La tradición alemana se siente en cada pinta. Hay que ir.' },
      { by: 'diego@lupulos.app', content: 'Las lagers del sur son las mejores de Chile, sin discusión.' },
      { by: 'demo@lupulos.app', content: 'Necesitamos una ruta cervecera del sur en la app!' },
    ],
  },
  {
    authorEmail: 'nico@lupulos.app',
    title: 'Detrás del grifo: un día como brewmaster',
    content: 'Muchos me preguntan cómo es el día a día de un cervecero profesional. Spoiler: es más limpieza que glamour. Pero ese momento en que pruebas un batch perfecto hace que todo valga la pena.',
    images: [],
    reactions: { like: ['maite@lupulos.app', 'rodrigo@lupulos.app', 'fan@lupulos.app', 'cata@lupulos.app', 'demo@lupulos.app', 'pame@lupulos.app'], cheers: ['nico@lupulos.app', 'rodrigo@lupulos.app'] },
    comments: [
      { by: 'maite@lupulos.app', content: 'Jaja confirmo lo de la limpieza. Mi homebrew es 70% lavar cosas.' },
      { by: 'rodrigo@lupulos.app', content: 'El 80% es sanitización, el 20% es magia. Así es esto.' },
      { by: 'fan@lupulos.app', content: 'Me encantaría un post más detallado del proceso completo.' },
      { by: 'cata@lupulos.app', content: 'Lo que pocos ven detrás de una buena cerveza. Gracias por compartir.' },
    ],
  },
  {
    authorEmail: 'sofi@lupulos.app',
    title: '¿Está Chile listo para la revolución sour?',
    content: 'Las cervezas ácidas están ganando terreno rápido en Chile. Guayacán, Jester y varios brewpubs ya las producen. ¿Será el próximo gran trend o seguirá siendo nicho? Mi apuesta: en 2 años serán mainstream.',
    images: [],
    reactions: { like: ['vale@lupulos.app', 'cata@lupulos.app', 'demo@lupulos.app', 'maite@lupulos.app'], cheers: ['sofi@lupulos.app'], recommended: ['vale@lupulos.app', 'cata@lupulos.app'] },
    comments: [
      { by: 'vale@lupulos.app', content: 'Como fan de las sour digo: ¡ya era hora! La Guayacán Frambuesa es perfecta.' },
      { by: 'cata@lupulos.app', content: 'Es el estilo que más convierte a no-cerveceros. Tiene futuro.' },
      { by: 'nico@lupulos.app', content: 'En Granizo estamos experimentando con sours. Es un mundo apasionante.' },
      { by: 'demo@lupulos.app', content: 'Ojalá más cervecerías se atrevan. Las fruit beer ácidas son geniales.' },
    ],
  },
  {
    authorEmail: 'diego@lupulos.app',
    title: 'En defensa de la lager artesanal',
    content: 'No todo tiene que ser IPA. Una buena lager requiere más técnica y deja menos margen de error que muchos estilos ale. Kunstmann, Volcanes del Sur y Kross lo demuestran batch tras batch.',
    images: [],
    reactions: { like: ['bartender@lupulos.app', 'rodrigo@lupulos.app', 'demo@lupulos.app', 'andres@lupulos.app', 'cata@lupulos.app'], cheers: ['diego@lupulos.app', 'rodrigo@lupulos.app'] },
    comments: [
      { by: 'bartender@lupulos.app', content: 'Como bartender, la lager bien hecha es la prueba de fuego de un cervecero.' },
      { by: 'rodrigo@lupulos.app', content: '100% de acuerdo. La Torobayo de Kunstmann es prueba de ello.' },
      { by: 'fan@lupulos.app', content: 'Soy IPA lover pero reconozco que una buena pils es otro nivel de técnica.' },
      { by: 'nico@lupulos.app', content: 'Las lagers son lo más difícil de hacer bien. No hay donde esconderse.' },
    ],
  },
  {
    authorEmail: 'maite@lupulos.app',
    title: 'Mi primera batch de homebrew: lecciones aprendidas',
    content: 'Después de 6 meses de lectura, compré mi kit y hice mi primera pale ale. ¿Resultado? Tomable pero con off-flavors. Lo que aprendí: sanitizar TODO, controlar temperatura de fermentación y tener paciencia.',
    images: [],
    reactions: { like: ['nico@lupulos.app', 'rodrigo@lupulos.app', 'demo@lupulos.app', 'fan@lupulos.app'], cheers: ['maite@lupulos.app', 'nico@lupulos.app'] },
    comments: [
      { by: 'nico@lupulos.app', content: 'Todos pasamos por eso. La segunda batch siempre es mejor. ¡Sigue!' },
      { by: 'rodrigo@lupulos.app', content: 'El control de temperatura es el secreto mejor guardado del homebrew.' },
      { by: 'demo@lupulos.app', content: 'Bienvenida al mundo del homebrew! Se viene la obsesión.' },
    ],
  },
  {
    authorEmail: 'fran@lupulos.app',
    title: 'Maridaje: cerveza artesanal + cocina chilena',
    content: 'La cerveza artesanal y la comida chilena hacen pareja increíble. Empanada de pino + amber ale, pastel de choclo + hefeweizen, curanto + smoked porter. ¡Prueben y me cuentan!',
    images: [],
    reactions: { like: ['cata@lupulos.app', 'bartender@lupulos.app', 'demo@lupulos.app', 'sofi@lupulos.app', 'pame@lupulos.app', 'diego@lupulos.app'], cheers: ['fran@lupulos.app', 'cata@lupulos.app'], recommended: ['bartender@lupulos.app', 'cata@lupulos.app', 'sofi@lupulos.app'] },
    comments: [
      { by: 'cata@lupulos.app', content: 'Curanto + smoked porter es GENIAL. No se me había ocurrido.' },
      { by: 'bartender@lupulos.app', content: 'Empanada + amber es un clásico que nunca falla.' },
      { by: 'sofi@lupulos.app', content: 'Este post merece un artículo completo. Qué buenas ideas.' },
      { by: 'demo@lupulos.app', content: 'Pastel de choclo + hefe... voy a probar este fin de semana.' },
      { by: 'diego@lupulos.app', content: 'Cazuela + bock maltosa. Esa es mi recomendación.' },
    ],
  },
  {
    authorEmail: 'tomas@lupulos.app',
    title: 'Ranking: los mejores taprooms del sur',
    content: 'Después de 2 años recorriendo el sur, acá va mi ranking personal: 1) Kunstmann Valdivia 2) Brewpub Patagonia Sur 3) Chester Beer Pucón 4) Bundor Valdivia 5) La Rana Puerto Montt.',
    images: [],
    reactions: { like: ['rodrigo@lupulos.app', 'cata@lupulos.app', 'demo@lupulos.app', 'andres@lupulos.app', 'diego@lupulos.app'], cheers: ['tomas@lupulos.app', 'rodrigo@lupulos.app', 'demo@lupulos.app'] },
    comments: [
      { by: 'rodrigo@lupulos.app', content: 'Buen ranking! Agregaría Cervecería Calle Calle en Valdivia.' },
      { by: 'cata@lupulos.app', content: 'Kunstmann en primer lugar es indiscutible.' },
      { by: 'andres@lupulos.app', content: 'Chester Beer en Pucón es joya escondida. Bien ahí.' },
      { by: 'demo@lupulos.app', content: 'Necesitamos esta info en la sección de Lugares de la app!' },
    ],
  },
  {
    authorEmail: 'vale@lupulos.app',
    title: 'Cervezas para quienes "no les gusta la cerveza"',
    content: 'Siempre me dicen "no me gusta la cerveza" y yo respondo: no has probado la correcta. Mi lista infalible: Guayacán Sour Frambuesa, Tubinger Hefeweizen, Guayacán Golden Ale. 100% tasa de conversión.',
    images: [],
    reactions: { like: ['caro@lupulos.app', 'demo@lupulos.app', 'cata@lupulos.app', 'sofi@lupulos.app', 'maite@lupulos.app', 'vale@lupulos.app'], cheers: ['vale@lupulos.app', 'cata@lupulos.app'], recommended: ['demo@lupulos.app', 'caro@lupulos.app'] },
    comments: [
      { by: 'caro@lupulos.app', content: 'La sour de frambuesa convirtió a tres amigas mías. Funciona.' },
      { by: 'cata@lupulos.app', content: 'Excelente lista de gateway beers. La hefeweizen es clave.' },
      { by: 'demo@lupulos.app', content: 'Post guardado. Lo voy a compartir cada vez que alguien me diga eso.' },
      { by: 'sofi@lupulos.app', content: 'Agregaría la Session IPA de Jester. Frutal y suave.' },
    ],
  },
  {
    authorEmail: 'andres@lupulos.app',
    title: 'Mi colección de latas: +500 etiquetas',
    content: 'Llevo 4 años coleccionando latas y etiquetas de cerveza artesanal chilena. Ya son más de 500. Las mejores: Jester por diseño, Kross por consistencia, Guayacán por color. ¿Alguien más colecciona?',
    images: [],
    reactions: { like: ['pame@lupulos.app', 'vale@lupulos.app', 'demo@lupulos.app', 'sofi@lupulos.app'], cheers: ['andres@lupulos.app'] },
    comments: [
      { by: 'pame@lupulos.app', content: 'Las etiquetas de Jester son obras de arte. Excelente colección.' },
      { by: 'sofi@lupulos.app', content: 'Me encantaría ver fotos de tu colección. ¿Tienes favorita?' },
      { by: 'vale@lupulos.app', content: 'Yo guardo las de Guayacán por los colores. Son hermosas.' },
    ],
  },
  {
    authorEmail: 'caro@lupulos.app',
    title: 'Los mejores bares pet-friendly para ir con tu perro',
    content: 'Mapeo de bares cerveceros donde puedes ir con tu compañero peludo: Viejo Lobo (Pichilemu), HopBar (Bellavista), Lupulado Beer Garden (Italia), Cervecería del Puerto (Valpo). Todos probados con mi perra Luna.',
    images: [],
    reactions: { like: ['demo@lupulos.app', 'vale@lupulos.app', 'fan@lupulos.app', 'tomas@lupulos.app', 'maite@lupulos.app'], cheers: ['caro@lupulos.app', 'vale@lupulos.app'] },
    comments: [
      { by: 'demo@lupulos.app', content: 'El Viejo Lobo es muy pet-friendly. Luna sería bienvenida.' },
      { by: 'vale@lupulos.app', content: 'En La Serena hay un par también. Si vienes te paso los datos.' },
      { by: 'fan@lupulos.app', content: 'HopBar en Bellavista confirmo. Mi gata... ok no, pero los perros sí.' },
      { by: 'tomas@lupulos.app', content: 'Necesitamos un filtro pet-friendly en la app!' },
    ],
  },
];

/* ═══════════════════════════════════════════
   FOLLOW GRAPH  (quién sigue a quién)
═══════════════════════════════════════════ */

const followGraph = [
  // demo sigue a muchos (fundador)
  { from: 'demo@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'fan@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'bartender@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'rodrigo@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'nico@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'sofi@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'tomas@lupulos.app' },
  { from: 'demo@lupulos.app', to: 'vale@lupulos.app' },
  // cata (sommelier popular)
  { from: 'cata@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'cata@lupulos.app', to: 'nico@lupulos.app' },
  { from: 'cata@lupulos.app', to: 'bartender@lupulos.app' },
  { from: 'cata@lupulos.app', to: 'fran@lupulos.app' },
  { from: 'cata@lupulos.app', to: 'rodrigo@lupulos.app' },
  { from: 'cata@lupulos.app', to: 'sofi@lupulos.app' },
  // fan
  { from: 'fan@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'fan@lupulos.app', to: 'nico@lupulos.app' },
  { from: 'fan@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'fan@lupulos.app', to: 'tomas@lupulos.app' },
  { from: 'fan@lupulos.app', to: 'maite@lupulos.app' },
  // bartender
  { from: 'bartender@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'bartender@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'bartender@lupulos.app', to: 'fran@lupulos.app' },
  { from: 'bartender@lupulos.app', to: 'nico@lupulos.app' },
  // maite
  { from: 'maite@lupulos.app', to: 'nico@lupulos.app' },
  { from: 'maite@lupulos.app', to: 'rodrigo@lupulos.app' },
  { from: 'maite@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'maite@lupulos.app', to: 'fan@lupulos.app' },
  // rodrigo
  { from: 'rodrigo@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'rodrigo@lupulos.app', to: 'nico@lupulos.app' },
  { from: 'rodrigo@lupulos.app', to: 'tomas@lupulos.app' },
  { from: 'rodrigo@lupulos.app', to: 'cata@lupulos.app' },
  // pame
  { from: 'pame@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'pame@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'pame@lupulos.app', to: 'nico@lupulos.app' },
  { from: 'pame@lupulos.app', to: 'andres@lupulos.app' },
  // diego
  { from: 'diego@lupulos.app', to: 'rodrigo@lupulos.app' },
  { from: 'diego@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'diego@lupulos.app', to: 'bartender@lupulos.app' },
  // sofi
  { from: 'sofi@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'sofi@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'sofi@lupulos.app', to: 'fran@lupulos.app' },
  { from: 'sofi@lupulos.app', to: 'pame@lupulos.app' },
  { from: 'sofi@lupulos.app', to: 'vale@lupulos.app' },
  // tomas
  { from: 'tomas@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'tomas@lupulos.app', to: 'rodrigo@lupulos.app' },
  { from: 'tomas@lupulos.app', to: 'fan@lupulos.app' },
  { from: 'tomas@lupulos.app', to: 'cata@lupulos.app' },
  // vale
  { from: 'vale@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'vale@lupulos.app', to: 'caro@lupulos.app' },
  { from: 'vale@lupulos.app', to: 'sofi@lupulos.app' },
  // nicolas
  { from: 'nico@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'nico@lupulos.app', to: 'rodrigo@lupulos.app' },
  { from: 'nico@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'nico@lupulos.app', to: 'maite@lupulos.app' },
  // fran
  { from: 'fran@lupulos.app', to: 'cata@lupulos.app' },
  { from: 'fran@lupulos.app', to: 'bartender@lupulos.app' },
  { from: 'fran@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'fran@lupulos.app', to: 'sofi@lupulos.app' },
  // andres
  { from: 'andres@lupulos.app', to: 'pame@lupulos.app' },
  { from: 'andres@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'andres@lupulos.app', to: 'sofi@lupulos.app' },
  // caro
  { from: 'caro@lupulos.app', to: 'demo@lupulos.app' },
  { from: 'caro@lupulos.app', to: 'vale@lupulos.app' },
  { from: 'caro@lupulos.app', to: 'fan@lupulos.app' },
  { from: 'caro@lupulos.app', to: 'cata@lupulos.app' },
];

/* ═══════════════════════════════════════════
   CHATS & CONVERSATIONS
═══════════════════════════════════════════ */

// Timestamps para que los mensajes tengan fechas escalonadas realistas
const daysAgo = (d, h = 12, m = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, m, 0, 0);
  return date;
};

const demoChats = [
  // ── Chat 1: Demo y Cata planificando una cata ──
  {
    participants: ['demo@lupulos.app', 'cata@lupulos.app'],
    messages: [
      { sender: 'demo@lupulos.app', content: 'Cata! Estaba pensando en organizar una cata de estilos belgas en el Viejo Lobo. ¿Te tinca?', ts: daysAgo(5, 10, 30) },
      { sender: 'cata@lupulos.app', content: 'Me encanta la idea! Tengo contacto con un importador que trae Chimay y Westmalle', ts: daysAgo(5, 10, 45) },
      { sender: 'demo@lupulos.app', content: 'Brutal. ¿Para cuántas personas lo armamos?', ts: daysAgo(5, 11, 0) },
      { sender: 'cata@lupulos.app', content: 'Yo diría máximo 20 para que sea íntimo. Así puedo explicar bien cada estilo', ts: daysAgo(5, 11, 15) },
      { sender: 'demo@lupulos.app', content: 'Dale, armemos la fecha. ¿Primer sábado de marzo?', ts: daysAgo(5, 11, 20) },
      { sender: 'cata@lupulos.app', content: 'Perfecto. Yo preparo la selección de cervezas y el material de cata', ts: daysAgo(5, 11, 30) },
      { sender: 'demo@lupulos.app', content: 'Genial, yo me encargo del espacio y la difusión en la app 🍺', ts: daysAgo(5, 11, 35) },
    ],
  },
  // ── Chat 2: Nico y Maite sobre homebrew ──
  {
    participants: ['nico@lupulos.app', 'maite@lupulos.app'],
    messages: [
      { sender: 'maite@lupulos.app', content: 'Nico, vi tu post sobre el día a día de brewmaster. Tengo una duda sobre mi homebrew', ts: daysAgo(4, 15, 0) },
      { sender: 'nico@lupulos.app', content: 'Claro, dime! En qué andas atrapada?', ts: daysAgo(4, 15, 10) },
      { sender: 'maite@lupulos.app', content: 'Mi pale ale tiene un off-flavor a diacetilo. Mantequilla en el final. No sé qué estoy haciendo mal', ts: daysAgo(4, 15, 15) },
      { sender: 'nico@lupulos.app', content: 'Clásico. Probablemente estás sacando la cerveza del fermentador muy pronto. Necesitas un diacetyl rest', ts: daysAgo(4, 15, 20) },
      { sender: 'maite@lupulos.app', content: '¿Cómo es eso?', ts: daysAgo(4, 15, 22) },
      { sender: 'nico@lupulos.app', content: 'Sube la temperatura a 18-20°C los últimos 2-3 días de fermentación. La levadura limpia el diacetilo solita', ts: daysAgo(4, 15, 25) },
      { sender: 'maite@lupulos.app', content: 'Aaah tiene sentido. Yo la pasaba directo al cold crash apenas terminaba la fermentación primaria', ts: daysAgo(4, 15, 30) },
      { sender: 'nico@lupulos.app', content: 'Ese es el problema. Dale tiempo a la levadura. Paciencia es la clave del homebrew 😄', ts: daysAgo(4, 15, 35) },
      { sender: 'maite@lupulos.app', content: 'Voy a probar en mi próximo batch. Mil gracias!! 🙏', ts: daysAgo(4, 15, 40) },
    ],
  },
  // ── Chat 3: Tomas y Rodrigo sobre el sur ──
  {
    participants: ['tomas@lupulos.app', 'rodrigo@lupulos.app'],
    messages: [
      { sender: 'tomas@lupulos.app', content: 'Rodrigo! Voy a estar en Valdivia la próxima semana. Alguna cervecería nueva que recomendar?', ts: daysAgo(3, 18, 0) },
      { sender: 'rodrigo@lupulos.app', content: 'Uf sí, abrió una micro nueva en el centro que está haciendo unas farmhouse ales brutales', ts: daysAgo(3, 18, 10) },
      { sender: 'tomas@lupulos.app', content: 'Farmhouse en Valdivia? Eso sí que es nuevo jaja', ts: daysAgo(3, 18, 15) },
      { sender: 'rodrigo@lupulos.app', content: 'Se llama Cervecería Calle Calle. Están usando levadura salvaje del río. Es experimental pero increíble', ts: daysAgo(3, 18, 20) },
      { sender: 'tomas@lupulos.app', content: 'Levadura del río Calle Calle??? Eso es muy loco, la tengo que probar', ts: daysAgo(3, 18, 25) },
      { sender: 'rodrigo@lupulos.app', content: 'Te llevo! Conozco al cervecero. También pásate por mi cervecería, tengo una nueva West Coast que quiero que pruebes', ts: daysAgo(3, 18, 30) },
      { sender: 'tomas@lupulos.app', content: 'Hecho! Te aviso cuando llegue. Gracias crack 🤙', ts: daysAgo(3, 18, 35) },
    ],
  },
  // ── Chat 4: Fran y Bartender sobre maridaje ──
  {
    participants: ['fran@lupulos.app', 'bartender@lupulos.app'],
    messages: [
      { sender: 'fran@lupulos.app', content: 'Oye, estoy armando un menú de maridaje para un evento. ¿Qué opinas de stout con postre de chocolate?', ts: daysAgo(2, 20, 0) },
      { sender: 'bartender@lupulos.app', content: 'Depende del postre. Si es muy dulce, mejor una imperial stout que tenga amargor para balancear', ts: daysAgo(2, 20, 10) },
      { sender: 'fran@lupulos.app', content: 'Estoy pensando en un fondant de chocolate 70%. Intenso y semi-amargo', ts: daysAgo(2, 20, 15) },
      { sender: 'bartender@lupulos.app', content: 'Con un fondant así yo iría con la Granizo Stout. Seca, café tostado, chocolate. Se complementan perfecto', ts: daysAgo(2, 20, 20) },
      { sender: 'fran@lupulos.app', content: 'Buena! Y para la entrada estoy pensando ceviche + algo ácido', ts: daysAgo(2, 20, 25) },
      { sender: 'bartender@lupulos.app', content: 'Gose o Berliner Weisse. La acidez y la sal acompañan el cítrico del ceviche. La Guayacán Sour sería ideal', ts: daysAgo(2, 20, 30) },
      { sender: 'fran@lupulos.app', content: 'Perfecto. Eres un genio del maridaje hermano 🍻', ts: daysAgo(2, 20, 35) },
      { sender: 'bartender@lupulos.app', content: '12 años detrás de la barra sirven de algo jaja. Avísame cómo resulta el evento!', ts: daysAgo(2, 20, 40) },
    ],
  },
  // ── Chat 5: Caro y Vale sobre bares pet-friendly ──
  {
    participants: ['caro@lupulos.app', 'vale@lupulos.app'],
    messages: [
      { sender: 'caro@lupulos.app', content: 'Vale! Vi que comentaste sobre bares pet-friendly en La Serena. ¿Cuáles son?', ts: daysAgo(2, 14, 0) },
      { sender: 'vale@lupulos.app', content: 'Hola! Sí, hay dos que me gustan mucho. Uno se llama La Lupulera, en el centro', ts: daysAgo(2, 14, 10) },
      { sender: 'vale@lupulos.app', content: 'Y el otro es Cervecería del Valle, tiene terraza grande donde los perritos andan libres', ts: daysAgo(2, 14, 12) },
      { sender: 'caro@lupulos.app', content: 'Que buena onda! Voy a ir a La Serena en marzo con mi perra Luna', ts: daysAgo(2, 14, 15) },
      { sender: 'vale@lupulos.app', content: 'Dale! Si quieres nos juntamos y te hago un tour cervecero serenense 😄', ts: daysAgo(2, 14, 20) },
      { sender: 'caro@lupulos.app', content: 'Sería increíble! Luna es super sociable, le encantan los bares jaja', ts: daysAgo(2, 14, 25) },
      { sender: 'vale@lupulos.app', content: 'Jajaj la esperamos entonces! Te mando los datos exactos cuando tengas fecha 🐕🍺', ts: daysAgo(2, 14, 30) },
    ],
  },
  // ── Chat 6: Pame y Sofi sobre fotos y blog ──
  {
    participants: ['pame@lupulos.app', 'sofi@lupulos.app'],
    messages: [
      { sender: 'sofi@lupulos.app', content: 'Pame, tus fotos de cervezas son increíbles. ¿Te interesaría colaborar conmigo en el blog?', ts: daysAgo(1, 11, 0) },
      { sender: 'pame@lupulos.app', content: 'Ohh me encantaría! ¿Qué tipo de colaboración tienes en mente?', ts: daysAgo(1, 11, 15) },
      { sender: 'sofi@lupulos.app', content: 'Estoy escribiendo una serie sobre cervecerías chilenas. Necesito buenas fotos para cada artículo', ts: daysAgo(1, 11, 20) },
      { sender: 'pame@lupulos.app', content: 'Me encanta la idea. ¿Cuál es la primera cervecería?', ts: daysAgo(1, 11, 25) },
      { sender: 'sofi@lupulos.app', content: 'Jester. Quiero hacer un especial sobre su proceso y sus cervezas más icónicas', ts: daysAgo(1, 11, 30) },
      { sender: 'pame@lupulos.app', content: 'Uf Jester es fotogénica. La King of Darkness con su botella negra es hermosa. Cuándo vamos?', ts: daysAgo(1, 11, 35) },
      { sender: 'sofi@lupulos.app', content: 'Ya tengo agendada visita para el viernes! Te confirmo hora 📸', ts: daysAgo(1, 11, 40) },
    ],
  },
  // ── Chat 7: Diego y Demo sobre la app ──
  {
    participants: ['diego@lupulos.app', 'demo@lupulos.app'],
    messages: [
      { sender: 'diego@lupulos.app', content: 'Oye, quería felicitarte por la app. Está quedando muy buena', ts: daysAgo(1, 19, 0) },
      { sender: 'demo@lupulos.app', content: 'Gracias Diego! Significa mucho viniendo de un cervecero de verdad', ts: daysAgo(1, 19, 10) },
      { sender: 'diego@lupulos.app', content: 'Una sugerencia: estaría genial poder filtrar cervezas por amargor IBU y no solo por estilo', ts: daysAgo(1, 19, 15) },
      { sender: 'demo@lupulos.app', content: 'Buena idea! Tenemos planificado agregar más filtros. IBU, SRM para color, y tipo de fermentación', ts: daysAgo(1, 19, 20) },
      { sender: 'diego@lupulos.app', content: 'Eso sería genial para los que buscamos cosas específicas. Yo siempre busco lagers con bajo IBU', ts: daysAgo(1, 19, 25) },
      { sender: 'demo@lupulos.app', content: 'Lo anoto. Se viene pronto! 💪', ts: daysAgo(1, 19, 30) },
    ],
  },
  // ── Chat 8: Grupo comunitario "Cerveceros de Santiago" ──
  {
    chatType: 'community',
    isGroup: true,
    name: 'Cerveceros de Santiago 🍺',
    admin: 'demo@lupulos.app',
    participants: ['demo@lupulos.app', 'cata@lupulos.app', 'fan@lupulos.app', 'pame@lupulos.app', 'sofi@lupulos.app', 'nico@lupulos.app', 'caro@lupulos.app'],
    messages: [
      { sender: 'demo@lupulos.app', content: 'Bienvenidos al grupo de Cerveceros de Santiago! Acá compartimos eventos, recomendaciones y buena onda 🍻', ts: daysAgo(7, 10, 0) },
      { sender: 'cata@lupulos.app', content: 'Hola a todos! Recuerden que el 8 de marzo hay cata de belgas en el Viejo Lobo', ts: daysAgo(6, 12, 0) },
      { sender: 'fan@lupulos.app', content: 'Buena! Yo me anoto. ¿Hay que reservar?', ts: daysAgo(6, 12, 30) },
      { sender: 'cata@lupulos.app', content: 'Sí, son 20 cupos. Reserven por la app o me escriben por interno', ts: daysAgo(6, 12, 35) },
      { sender: 'nico@lupulos.app', content: 'Gente, en HopBar esta semana hay tap takeover de Jester. Todos los grifos con Jester. Imperdible', ts: daysAgo(5, 14, 0) },
      { sender: 'pame@lupulos.app', content: 'Uhhh King of Darkness de grifo? Voy sí o sí', ts: daysAgo(5, 14, 15) },
      { sender: 'caro@lupulos.app', content: '¿Es pet-friendly el HopBar? Quiero llevar a Luna', ts: daysAgo(5, 14, 20) },
      { sender: 'nico@lupulos.app', content: 'Sí! Tiene terraza amplia. Lleva a Luna tranquila', ts: daysAgo(5, 14, 25) },
      { sender: 'sofi@lupulos.app', content: 'Yo voy a cubrir el evento para el blog. Si alguien quiere salir en la nota, avísenme 😄', ts: daysAgo(5, 15, 0) },
      { sender: 'fan@lupulos.app', content: 'Yo paso de la fama jaja pero sí voy a estar ahí con una Hazy Queen en mano', ts: daysAgo(5, 15, 10) },
      { sender: 'demo@lupulos.app', content: 'Nos vemos todos el viernes entonces! 🍺🤘', ts: daysAgo(5, 15, 30) },
      { sender: 'pame@lupulos.app', content: 'Alguien sabe si el Lupulado Beer Garden abre el domingo? Quiero ir a probar las sours', ts: daysAgo(3, 10, 0) },
      { sender: 'cata@lupulos.app', content: 'Sí, domingos de 12 a 21. Además tienen promo familiar con descuento en jarras', ts: daysAgo(3, 10, 15) },
      { sender: 'pame@lupulos.app', content: 'Perfecto, gracias Cata!', ts: daysAgo(3, 10, 20) },
      { sender: 'sofi@lupulos.app', content: 'Oigan, alguien ha probado la nueva Szot de temporada? Vi que la tienen en La Esquina del Lúpulo', ts: daysAgo(2, 16, 0) },
      { sender: 'nico@lupulos.app', content: 'Sí! Es una saison con pimienta. Bien interesante, vale la pena', ts: daysAgo(2, 16, 15) },
      { sender: 'fan@lupulos.app', content: 'Szot nunca decepciona. Voy a pasar este finde', ts: daysAgo(2, 16, 30) },
    ],
  },
  // ── Chat 9: Grupo "Homebrewers Chile" ──
  {
    chatType: 'community',
    isGroup: true,
    name: 'Homebrewers Chile 🏠🍺',
    admin: 'nico@lupulos.app',
    participants: ['nico@lupulos.app', 'maite@lupulos.app', 'rodrigo@lupulos.app', 'demo@lupulos.app', 'fan@lupulos.app'],
    messages: [
      { sender: 'nico@lupulos.app', content: 'Grupo para homebrewers! Compartan recetas, dudas y batches. Todos los niveles bienvenidos', ts: daysAgo(10, 9, 0) },
      { sender: 'maite@lupulos.app', content: 'Justo lo que necesitaba! Estoy empezando y tengo mil dudas', ts: daysAgo(10, 9, 30) },
      { sender: 'rodrigo@lupulos.app', content: 'Bienvenida Maite! Pregunta lo que necesites, todos empezamos así', ts: daysAgo(10, 9, 45) },
      { sender: 'maite@lupulos.app', content: '¿Qué kit recomiendan para empezar? Vi uno de 10 litros en Mercado Libre', ts: daysAgo(9, 11, 0) },
      { sender: 'nico@lupulos.app', content: 'Para empezar está bien 10L. Pero si puedes ir directo a 20L, mejor. Te da más margen de error', ts: daysAgo(9, 11, 15) },
      { sender: 'rodrigo@lupulos.app', content: 'Yo empecé con una olla de 20L y un balde fermentador. Lo básico. No te compliques al principio', ts: daysAgo(9, 11, 20) },
      { sender: 'fan@lupulos.app', content: 'Yo tengo ganas de empezar también. ¿Cuánto se gasta inicialmente?', ts: daysAgo(9, 12, 0) },
      { sender: 'nico@lupulos.app', content: 'Con 50-80 lucas armas un kit decente para tu primer batch. Lo más caro es el fermentador y la olla', ts: daysAgo(9, 12, 10) },
      { sender: 'demo@lupulos.app', content: 'Yo también quiero meterme al homebrew. ¿Qué estilo recomiendan para el primer batch?', ts: daysAgo(8, 14, 0) },
      { sender: 'nico@lupulos.app', content: 'Pale Ale o Blonde Ale. Son estilos nobles que perdonan errores. Nada muy lupulado ni muy oscuro al principio', ts: daysAgo(8, 14, 15) },
      { sender: 'rodrigo@lupulos.app', content: 'Confirmo. Mi primer batch fue una Blonde y salió bien. Simple y efectiva', ts: daysAgo(8, 14, 20) },
      { sender: 'maite@lupulos.app', content: 'Actualización: hice mi segunda batch con diacetyl rest como me recomendó Nico y salió MUCHO mejor! 🎉', ts: daysAgo(1, 16, 0) },
      { sender: 'nico@lupulos.app', content: '¡Bien ahí! Te dije que la segunda siempre mejora 💪', ts: daysAgo(1, 16, 10) },
      { sender: 'rodrigo@lupulos.app', content: 'Felicitaciones! Ahora viene la obsesión de querer mejorar cada batch jaja', ts: daysAgo(1, 16, 15) },
    ],
  },
  // ── Chat 10: Andres y Pame sobre colección de latas ──
  {
    participants: ['andres@lupulos.app', 'pame@lupulos.app'],
    messages: [
      { sender: 'andres@lupulos.app', content: 'Pame, vi que te gustan las etiquetas de Jester. Tengo unas ediciones limitadas que quizás no has visto', ts: daysAgo(3, 17, 0) },
      { sender: 'pame@lupulos.app', content: 'En serio?? Muero por verlas! Las de Jester son las que más me gustan por el arte', ts: daysAgo(3, 17, 10) },
      { sender: 'andres@lupulos.app', content: 'Tengo la primera edición de King of Darkness, antes de que cambiaran el diseño. Es de 2020', ts: daysAgo(3, 17, 15) },
      { sender: 'pame@lupulos.app', content: 'Noooo esa es una reliquia! ¿La tienes en buen estado?', ts: daysAgo(3, 17, 20) },
      { sender: 'andres@lupulos.app', content: 'Impecable. También tengo toda la serie de Hazy Queen de temporada. Cada una tiene arte diferente', ts: daysAgo(3, 17, 25) },
      { sender: 'pame@lupulos.app', content: 'Necesito fotografiar esa colección. ¿Te interesa un intercambio? Yo te hago fotos pro y tú me dejas ver todo', ts: daysAgo(3, 17, 30) },
      { sender: 'andres@lupulos.app', content: 'Trato hecho! Cuando quieras. Estoy en Temuco pero viajo a Santiago seguido', ts: daysAgo(3, 17, 35) },
    ],
  },
  // ── Chat 11: Grupo B2B de colaboración ──
  {
    chatType: 'b2b',
    isGroup: true,
    name: 'Mesa B2B Cervecera 📈',
    admin: 'demo@lupulos.app',
    participants: ['demo@lupulos.app', 'cata@lupulos.app', 'nico@lupulos.app', 'rodrigo@lupulos.app', 'fran@lupulos.app'],
    messages: [
      { sender: 'demo@lupulos.app', content: 'Bienvenidos a la Mesa B2B. Acá coordinamos colaboraciones entre cervecerías, bares y distribuidores.', ts: daysAgo(4, 9, 0) },
      { sender: 'rodrigo@lupulos.app', content: 'Estoy buscando partner en Santiago para distribuir nuestra nueva West Coast IPA.', ts: daysAgo(4, 9, 20) },
      { sender: 'nico@lupulos.app', content: 'Nos interesa. Podemos coordinar prueba en HopBar la próxima semana.', ts: daysAgo(4, 9, 35) },
      { sender: 'cata@lupulos.app', content: 'Yo puedo apoyar con evento de lanzamiento y cata guiada para prensa.', ts: daysAgo(4, 9, 50) },
      { sender: 'fran@lupulos.app', content: 'Y yo me sumo con menú de maridaje para la activación.', ts: daysAgo(4, 10, 5) },
    ],
  },
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */

const computeAverageRating = (reviews = []) => {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Number((sum / reviews.length).toFixed(2));
};

const uniqueIds = (values) => {
  const filtered = values.filter(Boolean).map((v) => v.toString());
  return Array.from(new Set(filtered));
};

const ensureUser = async (profile) => {
  let user = await User.findOne({ email: profile.email });

  const fields = {
    username: profile.username,
    bio: profile.bio,
    city: profile.city,
    country: profile.country,
    favoriteStyle: profile.favoriteStyle,
    isVerified: profile.isVerified,
    profilePicture: profile.profilePicture,
    plan: profile.plan,
    ...(profile.role && { role: profile.role }),
  };

  if (!user) {
    user = await User.create({ ...fields, email: profile.email, password: profile.password });
    return user;
  }

  await User.updateOne({ _id: user._id }, { $set: fields });
  return User.findById(user._id);
};

const buildReactions = (reactions = {}, uByEmail = {}) => {
  const mapEmails = (emails = []) =>
    uniqueIds(emails.map((e) => uByEmail[e]?._id).filter(Boolean));

  const cheers = mapEmails(reactions.cheers || []);
  const recommended = mapEmails(reactions.recommended || []);
  const like = mapEmails(reactions.like || []);

  return {
    reactions: {
      cheers: { count: cheers.length, users: cheers },
      recommended: { count: recommended.length, users: recommended },
      like: { count: like.length, users: like },
    },
    reactionUsers: { cheers, recommended, like },
  };
};

const upsertBeer = async (beerData, uByEmail) => {
  const creatorId = uByEmail[beerData.createdBy]?._id;

  const reviews = (beerData.reviews || []).map((r) => ({
    comment: r.comment,
    rating: r.rating,
    user: uByEmail[r.by]?._id || creatorId,
  }));

  const likes = uniqueIds([
    creatorId,
    ...(beerData.likesBy || []).map((e) => uByEmail[e]?._id).filter(Boolean),
  ]);

  const payload = {
    name: beerData.name,
    brewery: beerData.brewery,
    style: beerData.style,
    abv: beerData.abv,
    description: beerData.description,
    image: beerData.image || '',
    createdBy: creatorId,
    reviews,
    averageRating: computeAverageRating(reviews),
    likes,
  };

  const existing = await Beer.findOne({ name: beerData.name, brewery: beerData.brewery });
  if (!existing) return Beer.create(payload);
  Object.assign(existing, payload);
  await existing.save();
  return existing;
};

const upsertPost = async (postData, uByEmail) => {
  const authorId = uByEmail[postData.authorEmail]?._id;
  const { reactions, reactionUsers } = buildReactions(postData.reactions, uByEmail);

  const payload = {
    author: authorId,
    title: postData.title,
    content: postData.content,
    images: postData.images || [],
    reactions,
    views: Math.floor(Math.random() * 400) + 40,
  };

  let post = await Post.findOne({ author: authorId, title: postData.title });
  if (!post) {
    post = await Post.create(payload);
  } else {
    Object.assign(post, payload);
    await post.save();
  }

  const commentIds = [];
  for (const c of postData.comments || []) {
    const cAuthor = uByEmail[c.by]?._id || authorId;
    let comment = await Comment.findOne({ post: post._id, author: cAuthor, content: c.content });
    if (!comment) {
      comment = await Comment.create({ content: c.content, author: cAuthor, post: post._id });
    }
    commentIds.push(comment._id);
    await User.updateOne({ _id: cAuthor }, { $addToSet: { comments: comment._id } });
  }

  if (commentIds.length) {
    await Post.updateOne({ _id: post._id }, { $addToSet: { comments: { $each: commentIds } } });
  }

  return { post, reactionUsers, commentIds };
};

const upsertPlace = async (placeData, uByEmail, beersByName) => {
  const ownerId = uByEmail[placeData.owner]?._id;

  const reviews = (placeData.reviews || []).map((r) => ({
    user: uByEmail[r.by]?._id || ownerId,
    comment: r.comment,
    rating: r.rating,
  }));

  const beerIds = (placeData.beers || []).map((n) => beersByName.get(n)).filter(Boolean);

  const payload = {
    name: placeData.name,
    description: placeData.description,
    address: placeData.address,
    phone: placeData.phone,
    website: placeData.website,
    contactEmail: placeData.contactEmail,
    coverImage: placeData.coverImage,
    gallery: placeData.gallery,
    beers: beerIds,
    reviews,
    averageRating: computeAverageRating(reviews),
    openingHours: placeData.openingHours,
    socialLinks: placeData.socialLinks,
    events: placeData.events,
    promotions: placeData.promotions,
    amenities: placeData.amenities,
    isPetFriendly: placeData.isPetFriendly,
    hasLiveMusic: placeData.hasLiveMusic,
    hasTerrace: placeData.hasTerrace,
    hasParking: placeData.hasParking,
    visits: Math.floor(Math.random() * 800) + 100,
    popularityScore: Math.floor(Math.random() * 50) + 10,
    owner: ownerId,
  };

  let place = await Place.findOne({ name: placeData.name, 'address.city': placeData.address.city });
  if (!place) {
    place = await Place.create(payload);
  } else {
    Object.assign(place, payload);
    await place.save();
  }
  return place;
};

/* ═══════════════════════════════════════════
   MAIN  SEED
═══════════════════════════════════════════ */

const seedDemo = async () => {
  await connectDB();
  console.log('🌱 Seeding demo data...\n');

  /* ── Users ── */
  const uByEmail = {};
  for (const p of demoUsers) {
    const u = await ensureUser(p);
    uByEmail[p.email] = u;
  }
  console.log(`👥 ${Object.keys(uByEmail).length} users ready`);

  /* ── Beers ── */
  const createdBeers = [];
  for (const b of demoBeers) {
    const beer = await upsertBeer(b, uByEmail);
    createdBeers.push(beer);
  }
  const beersByName = new Map(createdBeers.map((b) => [b.name, b._id]));
  console.log(`🍺 ${createdBeers.length} beers ready`);

  /* ── Places ── */
  const createdPlaces = [];
  for (const p of demoPlaces) {
    const place = await upsertPlace(p, uByEmail, beersByName);
    createdPlaces.push(place);
  }
  console.log(`📍 ${createdPlaces.length} places ready`);

  /* ── Posts ── */
  const createdPosts = [];
  const likedPostsByUser = new Map();

  for (const pd of demoPosts) {
    const { post, reactionUsers } = await upsertPost(pd, uByEmail);
    createdPosts.push(post);
    for (const uid of reactionUsers.like) {
      const cur = likedPostsByUser.get(uid) || [];
      cur.push(post._id);
      likedPostsByUser.set(uid, cur);
    }
  }
  console.log(`📝 ${createdPosts.length} posts ready`);

  /* ── Update user activity arrays ── */
  // beersCreated
  const beersByCreator = new Map();
  for (const b of demoBeers) {
    const uid = uByEmail[b.createdBy]?._id;
    const beerId = beersByName.get(b.name);
    if (uid && beerId) {
      const arr = beersByCreator.get(uid.toString()) || [];
      arr.push(beerId);
      beersByCreator.set(uid.toString(), arr);
    }
  }
  for (const [uid, beerIds] of beersByCreator) {
    await User.updateOne({ _id: uid }, { $addToSet: { beersCreated: { $each: beerIds } } });
  }

  // postsCreated
  const postsByAuthor = new Map();
  for (let i = 0; i < demoPosts.length; i++) {
    const uid = uByEmail[demoPosts[i].authorEmail]?._id;
    if (uid) {
      const arr = postsByAuthor.get(uid.toString()) || [];
      arr.push(createdPosts[i]._id);
      postsByAuthor.set(uid.toString(), arr);
    }
  }
  for (const [uid, postIds] of postsByAuthor) {
    await User.updateOne({ _id: uid }, { $addToSet: { postsCreated: { $each: postIds } } });
  }

  // locationsCreated
  const placesByOwner = new Map();
  for (let i = 0; i < demoPlaces.length; i++) {
    const uid = uByEmail[demoPlaces[i].owner]?._id;
    if (uid) {
      const arr = placesByOwner.get(uid.toString()) || [];
      arr.push(createdPlaces[i]._id);
      placesByOwner.set(uid.toString(), arr);
    }
  }
  for (const [uid, placeIds] of placesByOwner) {
    await User.updateOne({ _id: uid }, { $addToSet: { locationsCreated: { $each: placeIds } } });
  }

  // likedPosts
  for (const [uid, postIds] of likedPostsByUser) {
    await User.updateOne({ _id: uid }, { $addToSet: { likedPosts: { $each: postIds } } });
  }

  /* ── Follow graph ── */
  const followingMap = new Map();
  const followersMap = new Map();

  for (const { from, to } of followGraph) {
    const fromId = uByEmail[from]?._id?.toString();
    const toId = uByEmail[to]?._id?.toString();
    if (!fromId || !toId || fromId === toId) continue;

    if (!followingMap.has(fromId)) followingMap.set(fromId, new Set());
    followingMap.get(fromId).add(toId);

    if (!followersMap.has(toId)) followersMap.set(toId, new Set());
    followersMap.get(toId).add(fromId);
  }

  for (const [uid, followingSet] of followingMap) {
    await User.updateOne(
      { _id: uid },
      { $addToSet: { following: { $each: [...followingSet] } } }
    );
  }
  for (const [uid, followersSet] of followersMap) {
    await User.updateOne(
      { _id: uid },
      { $addToSet: { followers: { $each: [...followersSet] } } }
    );
  }
  console.log(`🤝 ${followGraph.length} follow relationships ready`);

  /* ── Chats & Messages ── */
  let chatCount = 0;
  let msgCount = 0;

  for (const chatData of demoChats) {
    const chatType = chatData.chatType || 'community';
    const participantIds = chatData.participants
      .map((e) => uByEmail[e]?._id)
      .filter(Boolean);

    if (participantIds.length < 2) continue;

    // Find or create the chat
    let chat;
    if (chatData.isGroup) {
      chat = await Chat.findOne({ name: chatData.name, isGroup: true, chatType });
      if (!chat) {
        chat = await Chat.create({
          participants: participantIds,
          isGroup: true,
          chatType,
          name: chatData.name,
          groupAdmin: uByEmail[chatData.admin]?._id,
        });
      } else {
        chat.participants = participantIds;
        chat.chatType = chatType;
        chat.groupAdmin = uByEmail[chatData.admin]?._id;
        await chat.save();
      }
    } else {
      // 1-to-1: find existing chat with same participants
      chat = await Chat.findOne({
        isGroup: { $ne: true },
        chatType,
        participants: { $all: participantIds, $size: participantIds.length },
      });
      if (!chat) {
        chat = await Chat.create({ participants: participantIds, chatType });
      }
    }

    // Upsert messages
    let lastMsg = null;
    for (const m of chatData.messages) {
      const senderId = uByEmail[m.sender]?._id;
      if (!senderId) continue;

      let msg = await Message.findOne({
        chat: chat._id,
        sender: senderId,
        content: m.content,
      });

      if (!msg) {
        msg = await Message.create({
          chat: chat._id,
          sender: senderId,
          content: m.content,
          type: 'text',
          readBy: participantIds.map((uid) => ({ user: uid, readAt: m.ts })),
          createdAt: m.ts,
          updatedAt: m.ts,
        });
        msgCount++;
      }
      lastMsg = msg;
    }

    // Update lastMessage on chat
    if (lastMsg) {
      await Chat.updateOne({ _id: chat._id }, { $set: { lastMessage: lastMsg._id } });
    }
    chatCount++;
  }
  console.log(`💬 ${chatCount} chats with ${msgCount} messages ready`);

  /* ── Summary ── */
  console.log('\n✅ Demo data seeded successfully!\n');
  console.log('── Login credentials (all passwords: demo1234) ──');
  for (const p of demoUsers) {
    console.log(`  ${p.username.padEnd(20)} ${p.email.padEnd(28)} plan=${p.plan}`);
  }
  console.log(`\n🍺 ${createdBeers.length} beers | 📍 ${createdPlaces.length} places | 📝 ${createdPosts.length} posts | 💬 ${chatCount} chats | 👥 ${demoUsers.length} users`);
};

seedDemo()
  .catch((err) => {
    console.error('❌ Demo seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
