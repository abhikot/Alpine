var mongoose  = require('mongoose');
var connect = process.env.MONGODB_URI;
var Schema = mongoose.Schema;

mongoose.connection.on('error', function() {
  console.log('error connecting to database')
})
mongoose.connection.on('connected', function() {
  console.log('succesfully connected to database')
})

mongoose.connect(connect);

// Build User Schemas
var userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  biography: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  userType: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'client', 'consultant']
  },
  currentProducts: {
    type: Array,
    default: []
  },
  orderHistory: {
    type: Array,
    default: []
  },
  consultant: {
    type: String,
    ref: User
  }
})

//Payment Schema: DEFINITELY MODIFY THIS
var paymentSchema = new Schema({
  stripeBrand: String,
  stripeCustomerId: String,
  stripeExpMonth: Number,
  paymentAmount : Number,
  stripeExpYear: Number,
  stripeLast4: Number,
  stripeSource: String,
  status: String,
  _userid : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
})
//PRODUCT SCHEMA: Also modify this
var productSchema = new Schema ({
  title : {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price : {
    type: String,
    required: true
  }
})

var consultationSchema = new Schema ({
  client: {
    type: String,
    ref: User
  },
  description: {
    type: String,
  },
  duration : {
    type: String,
    required: true
  },
  sessionNumber: {
    type: Number,
    required: true
  }

})
//MONGODB MODELS
var User = mongoose.model('User', userSchema);
var Payment = mongoose.model('Payment', paymentSchema)
var Product = mongoose.model('Product', productSchema)



module.exports = {
  User: User,
  Payment: Payment,
  Product: Product
}
