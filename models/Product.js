const mongoose = require('mongoose');

/*
* Ce modèle nous permettra d'enregistrer les demandes de sorties de produit
*/
  let ProductDemandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty:  { type: Number, required: true, default: 0 },
  issuedBy: { type: String, required: true }, // L'utilisateur ayant fait la demande
  /*
  * La variable for permet de donner la possibilité aux "rangs supérieurs" de transférer une demande à des personnes.
  * Dans le cas où la variable for serait EVERYONE, elle serait donnée à tout le monde, mais l'utilisateur la voulant se
  * verra obliger de cliquer sur le bouton "Prendre", qui changera la variable for de sorte à ce qu'elle soit affichée que pour lui.
    Si la variable est égale à null, alors la demande sera envoyée à l'utilisateur qui à fait la demande (issuedBy)
  */
  for: { type: String, default: null },
  additionalInfo: String,
  /*
  * Facture acquitté - Oui = 1, Non = 0, Partiellement = 2
  */
  paidInvoice: { type: Number, required: true, default: 0 },
  clientName: { type: String, required: true },
  createdDate: { type: Date, required: true, default: new Date() },
  validationDate: Date,
  validated: { type: Boolean, required: true, default: false },
  status: { type: String, required: true, default: 'AWAITING_VALIDATION' },
  deadline: Date
});


let ProductSchema = new mongoose.Schema({
  id: { type: String, default: generate() },
  image: { type: String, default: 'http://via.placeholder.com/250x300?text=Pas%20d%27image' },
  name: { type: String, required: true },
  metadata: [String],
  desc: { type: String, default: 'Cet objet n\'a pas de description.' },
  qty: { type: Number, default: 0 },
  price: { type: String, required: true },
  location: String,
  demands: [ProductDemandSchema],
  creationDate: { type: Date, required: true, default: new Date() },
  disabled: { type: Boolean, default: false }
});

/*
* Cette méthode permet d'exécuter du code avant la sauvegarde d'un document Product.
* Dans ce cas-ci, elle nous permet de déterminer une version "plurialisée" du nom, qui sera modifiable dans l'interface par la suite.
* Le but est que si on donne en nom "Disque dur Seagate", on devrait obtenir quand on l'affiche sur la page "x disques durs Seagate"
*/
ProductSchema.virtual('plurializedName').get(function() {
  let plurialized = this.name.toLowerCase().split(' ');

  for (let i = 0; i < plurialized.length; i++)
    if (plurialized[i].slice(-1) !== 's' && plurialized[i].slice(-1) !== 'x') plurialized[i] += 's';

  return plurialized.join(' ');
});

module.exports = ProductSchema;
