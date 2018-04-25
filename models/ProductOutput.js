const mongoose = require('mongoose');

/*
* Ce modèle nous permettra d'enregistrer les demandes de sorties de produit
*/
let ProductOutputSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  qty:  { type: Number, required: true, default: 0 },
  /*
  * Facture acquitté - Oui = 1, Non = 0, Partiellement = 2
  */
  paidInvoice: { type: Number, required: true },
  clientName: { type: String, required: true },
  createdDate: { type: Date, required: true, default: new Date() },
  validationDate: { type: Date },
  validated: { type: Boolean, required: true, default: false },
  status: { type: String, required: true, default: 'AWAITING_VALIDATION' }
});

ProductOutputSchema.methods.validate = async () => {
  this.validated = true;
  this.validationDate = new Date();
  this.status = 'VALIDATED';

  await this.save();
};

ProductOutputSchema.methods.cancel = async () => {
  this.status = 'CANCELLED';

  await this.save();
};

module.exports = ProductOutputSchema;
