import product11 from '@/assets/images/products/product-1(1).png';
import product2 from '@/assets/images/products/product-2.png';
import product3 from '@/assets/images/products/product-3.png';
import product4 from '@/assets/images/products/product-4.png';
import product5 from '@/assets/images/products/product-5.png';
import product6 from '@/assets/images/products/product-6.png';
import product12 from '@/assets/images/products/product-1(2).png';
import avatar1 from '@/assets/images/users/avatar-1.jpg';
import avatar2 from '@/assets/images/users/avatar-2.jpg';
import avatar3 from '@/assets/images/users/avatar-3.jpg';
import avatar4 from '@/assets/images/users/avatar-4.jpg';
import avatar5 from '@/assets/images/users/avatar-5.jpg';
import avatar6 from '@/assets/images/users/avatar-6.jpg';
import avatar7 from '@/assets/images/users/avatar-7.jpg';
import avatar8 from '@/assets/images/users/avatar-8.jpg';
import avatar9 from '@/assets/images/users/avatar-9.jpg';
import avatar10 from '@/assets/images/users/avatar-10.jpg';
export const categoriesData = [{
  id: '1001',
  name: 'Computer'
}, {
  id: '1002',
  name: 'Camera'
}, {
  id: '1003',
  name: 'Headphones'
}, {
  id: '1004',
  name: 'Mobile'
}, {
  id: '1005',
  name: 'Pendrive'
}];
export const sellersData = [
  {
    id: '101',
    name: 'Anna M. Hines',
    storeName: 'Acme',
    image: avatar1,
    productsCount: 356,
    walletBalance: 256.45,
    revenue: 269.56,
    createdAt: new Date('09/04/2021'),
    review: {
      count: 588,
      stars: 5,
    },
  },
  {
    id: '102',
    name: 'Candice F. Gilmore',
    storeName: 'Globex',
    image: avatar2,
    productsCount: 289,
    walletBalance: 156.98,
    revenue: 89.75,
    createdAt: new Date('03/31/2021'),
    review: {
      count: 650,
      stars: 3.2,
    },
  },
  {
    id: '103',
    name: 'Vanessa R. Davis',
    storeName: 'Soylent',
    image: avatar3,
    productsCount: 71,
    walletBalance: 859.5,
    revenue: 452.5,
    createdAt: new Date('01/02/2020'),
    review: {
      count: 129,
      stars: 4.5,
    },
  },
  {
    id: '104',
    name: 'Judith H. Fritsche',
    storeName: 'Initech',
    image: avatar4,
    productsCount: 125,
    walletBalance: 163.75,
    revenue: 365,
    createdAt: new Date('09/05/2020'),
    review: {
      count: 523,
      stars: 2.5,
    },
  },
  {
    id: '105',
    name: 'Peter T. Smith',
    storeName: 'Hooli',
    image: avatar5,
    productsCount: 265,
    walletBalance: 545,
    revenue: 465.59,
    createdAt: new Date('05/22/2019'),
    review: {
      count: 241,
      stars: 3.7,
    },
  },
  {
    id: '106',
    name: 'Emmanuel J. Delcid',
    storeName: 'Vehement',
    image: avatar6,
    productsCount: 68,
    walletBalance: 136.54,
    revenue: 278.95,
    createdAt: new Date('01/12/2019'),
    review: {
      count: 4325,
      stars: 4.3,
    },
  },
  {
    id: '107',
    name: 'William J. Cook',
    storeName: 'Massive',
    image: avatar7,
    productsCount: 550,
    walletBalance: 365.85,
    revenue: 475.96,
    createdAt: new Date('06/1/2021'),
    review: {
      count: 6667,
      stars: 1.8,
    },
  },
  {
    id: '108',
    name: 'Martin R. Peters',
    storeName: 'Fringe',
    image: avatar8,
    productsCount: 123,
    walletBalance: 95.7,
    revenue: 142,
    createdAt: new Date('03/04/2020'),
    review: {
      count: 23,
      stars: 3.5,
    },
  },
  {
    id: '109',
    name: 'Paul M. Schubert',
    storeName: 'Weeds',
    image: avatar9,
    productsCount: 789,
    walletBalance: 423.4,
    revenue: 652.9,
    createdAt: new Date('05/07/2020'),
    review: {
      count: 223,
      stars: 5,
    },
  },
  {
    id: '110',
    name: 'Janet J. Champine',
    storeName: 'Soylent',
    image: avatar10,
    productsCount: 75,
    walletBalance: 216.8,
    revenue: 180.75,
    createdAt: new Date('07/13/2019'),
    review: {
      count: 231,
      stars: 4.6,
    },
  },
]
export const ecommerceProductsData = [{
  id: '10001',
  categoryId: '1001',
  sellerId: '101',
  name: 'G15 Gaming Laptop',
  description: 'Power Your Laptop with a Long-Lasting and Fast-Charging Battery.',
  images: [product11],
  price: 999,
  quantity: 9,
  review: {
    count: 1055,
    stars: 5
  },
  sale: {
    discount: 50,
    type: 'percent'
  }
}, {
  id: '10002',
  categoryId: '1002',
  sellerId: '102',
  name: 'Sony Alpha ILCE 6000Y 24.3 MP Mirrorless Digital SLR Camera',
  description: 'Capture special moments and portraits to remember and share.',
  images: [product2],
  price: 485,
  quantity: 10,
  review: {
    count: 680,
    stars: 5
  }
}, {
  id: '10003',
  categoryId: '1003',
  sellerId: '103',
  name: 'Sony Over-Ear Wireless Headphone with Mic',
  description: "Headphones are a pair of small loudspeaker drivers worn on or around the head over a user's ears.",
  images: [product3],
  price: 698,
  quantity: 56,
  review: {
    count: 2394,
    stars: 4.5
  },
  sale: {
    discount: 5,
    type: 'amount'
  }
}, {
  id: '10004',
  categoryId: '1004',
  sellerId: '104',
  name: 'Apple iPad Pro with Apple M1 chip',
  description: 'The new iPad mini and iPad.',
  images: [product4],
  price: 356,
  quantity: 0,
  review: {
    count: 588,
    stars: 5
  }
}, {
  id: '10005',
  categoryId: '1005',
  sellerId: '105',
  name: 'Adam ROMA USB-C / USB-A 3.1 (2-in-1 Flash Drive) – 128GB',
  description: 'A USB flash drive is a data storage device that includes flash memory with an integrated USB interface.',
  images: [product5],
  price: 854,
  quantity: 390,
  review: {
    count: 650,
    stars: 5
  },
  sale: {
    discount: 12,
    type: 'amount'
  }
}, {
  id: '10006',
  categoryId: '1004',
  sellerId: '106',
  name: 'Apple iPHone 13',
  description: 'The new iPHone 1 and iPad.',
  images: [product6],
  price: 763,
  quantity: 209,
  review: {
    count: 129,
    stars: 5
  }
}, {
  id: '10007',
  categoryId: '1001',
  sellerId: '107',
  name: 'Apple Mac',
  description: 'Power Your Laptop with a Long-Lasting and Fast-Charging Battery.',
  images: [product12],
  price: 629,
  quantity: 2,
  review: {
    count: 523,
    stars: 5
  },
  sale: {
    discount: 40,
    type: 'percent'
  }
}];
export const customersData = [{
  id: '2001',
  image: avatar1,
  name: 'Anna M. Hines',
  createdAt: new Date('23 April 2024'),
  email: 'anna.hines@mail.com',
  phone: '(+1)-555-1564-261',
  ordersCount: 15,
  address: 'Burr Ridge/Illinois',
  role: 'Lawyer'
}, {
  id: '2002',
  image: avatar2,
  name: 'Candice F. Gilmore',
  createdAt: new Date('12 April 2024'),
  email: 'candice.gilmore@mail.com',
  phone: '(+257)-755-5532-588',
  ordersCount: 215,
  address: 'Roselle/Illinois',
  role: 'Mediator'
}, {
  id: '2003',
  image: avatar3,
  name: 'Vanessa R. Davis',
  createdAt: new Date('15 March 2024'),
  email: 'vanessa.davis@mail.com',
  phone: '(+1)-441-5558-183',
  address: 'Wann/Oklahoma',
  ordersCount: 125,
  role: 'Counsellor'
}, {
  id: '2004',
  image: avatar4,
  name: 'Judith H. Fritsche',
  createdAt: new Date('11 January 2024'),
  email: 'judith.fritsche.com',
  phone: '(+57)-305-5579-759',
  address: 'SULLIVAN/Kentucky',
  ordersCount: 5,
  role: 'Therapist'
}, {
  id: '2005',
  image: avatar5,
  name: 'Peter T. Smith',
  createdAt: new Date('03 December 2023'),
  email: 'peter.smith@mail.com',
  phone: '(+33)-655-5187-93',
  address: 'Yreka/California',
  ordersCount: 15,
  role: 'Lawyer'
}, {
  id: '2006',
  image: avatar6,
  name: 'Emmanuel J. Delcid',
  createdAt: new Date('12 April 2024'),
  email: 'emmanuel.delicid@mail.com',
  phone: '(+30)-693-5553-637',
  address: 'Atlanta/Georgia',
  ordersCount: 10,
  role: 'Mediator'
}, {
  id: '2007',
  image: avatar7,
  name: 'William J. Cook',
  createdAt: new Date('13 November 2023'),
  email: 'william.cook@mail.com',
  phone: '(+91)-855-5446-150',
  address: 'Rosenberg/Texas',
  ordersCount: 85,
  role: 'Counsellor'
}, {
  id: '2008',
  image: avatar8,
  name: 'Martin R. Peters',
  createdAt: new Date('25 August 2023'),
  email: 'martin.peters@mail.com',
  phone: '(+61)-455-5943-13',
  address: 'Youngstown/Ohio',
  ordersCount: 3,
  role: 'Therapist'
}, {
  id: '2009',
  image: avatar9,
  name: 'Paul M. Schubert',
  createdAt: new Date('28 April 2024'),
  email: 'paul.schubert@mail.com',
  phone: '(+61)-035-5531-64',
  address: 'Austin/Texas',
  ordersCount: 181,
  role: 'Lawyer'
}, {
  id: '2010',
  image: avatar10,
  name: 'Janet J. Champine',
  createdAt: new Date('06 May 2023'),
  email: 'janet.champine@mail.com',
  phone: '(+880)-115-5592-916',
  address: 'Nashville/Tennessee',
  ordersCount: 521,
  role: 'Mediator'
}];
export const lawyerData =[
  {
  id: '2001',
  image: avatar1,
  name: 'Sophia R. Bennett',
  createdAt: new Date('12 January 2024'),
  email: 'sophia.bennett@mail.com',
  phone: '(+1)-202-455-7761',
  address: 'New York/USA',
  ordersCount: 132,
  role: 'Lawyer'
},
{
  id: '2002',
  image: avatar2,
  name: 'Ethan K. Turner',
  createdAt: new Date('05 February 2024'),
  email: 'ethan.turner@mail.com',
  phone: '(+44)-020-7689-4321',
  address: 'London/UK',
  ordersCount: 95,
  role: 'Lawyer'
},
{
  id: '2003',
  image: avatar3,
  name: 'Amelia D. Grant',
  createdAt: new Date('22 March 2024'),
  email: 'amelia.grant@mail.com',
  phone: '(+61)-041-2245-732',
  address: 'Sydney/Australia',
  ordersCount: 178,
  role: 'Lawyer'
},
{
  id: '2004',
  image: avatar4,
  name: 'Liam J. Carter',
  createdAt: new Date('09 April 2024'),
  email: 'liam.carter@mail.com',
  phone: '(+1)-303-789-5542',
  address: 'Denver/USA',
  ordersCount: 204,
  role: 'Lawyer'
},
{
  id: '2005',
  image: avatar5,
  name: 'Isabella F. Clarke',
  createdAt: new Date('17 May 2024'),
  email: 'isabella.clarke@mail.com',
  phone: '(+49)-030-997-4382',
  address: 'Berlin/Germany',
  ordersCount: 156,
  role: 'Lawyer'
},
{
  id: '2006',
  image: avatar6,
  name: 'Noah L. Walker',
  createdAt: new Date('06 June 2024'),
  email: 'noah.walker@mail.com',
  phone: '(+33)-01-772-5554',
  address: 'Paris/France',
  ordersCount: 189,
  role: 'Lawyer'
},
{
  id: '2007',
  image: avatar7,
  name: 'Olivia M. Hughes',
  createdAt: new Date('14 July 2024'),
  email: 'olivia.hughes@mail.com',
  phone: '(+1)-415-445-7731',
  address: 'San Francisco/USA',
  ordersCount: 221,
  role: 'Lawyer'
},
{
  id: '2008',
  image: avatar8,
  name: 'James T. Robinson',
  createdAt: new Date('20 August 2024'),
  email: 'james.robinson@mail.com',
  phone: '(+61)-043-6643-771',
  address: 'Melbourne/Australia',
  ordersCount: 173,
  role: 'Lawyer'
},
{
  id: '2009',
  image: avatar9,
  name: 'Paul M. Schubert',
  createdAt: new Date('28 April 2024'),
  email: 'paul.schubert@mail.com',
  phone: '(+61)-035-5531-64',
  address: 'Austin/Texas',
  ordersCount: 181,
  role: 'Lawyer'
},
{
  id: '2010',
  image: avatar10,
  name: 'Charlotte B. Foster',
  createdAt: new Date('02 September 2024'),
  email: 'charlotte.foster@mail.com',
  phone: '(+1)-646-897-5532',
  address: 'Chicago/USA',
  ordersCount: 144,
  role: 'Lawyer'
}

];

export const mediatorData =
[
  {
    id: '3001',
    image: avatar1,
    name: 'Benjamin L. Adams',
    createdAt: new Date('10 February 2024'),
    email: 'benjamin.adams@mail.com',
    phone: '(+1)-213-332-8891',
    address: 'Los Angeles/USA',
    ordersCount: 92,
    role: 'Mediator'
  },
  {
    id: '3002',
    image: avatar2,
    name: 'Grace E. Collins',
    createdAt: new Date('25 February 2024'),
    email: 'grace.collins@mail.com',
    phone: '(+44)-020-8444-6532',
    address: 'Manchester/UK',
    ordersCount: 108,
    role: 'Mediator'
  },
  {
    id: '3003',
    image: avatar3,
    name: 'Lucas P. Morgan',
    createdAt: new Date('18 March 2024'),
    email: 'lucas.morgan@mail.com',
    phone: '(+61)-041-5643-332',
    address: 'Brisbane/Australia',
    ordersCount: 120,
    role: 'Mediator'
  },
  {
    id: '3004',
    image: avatar4,
    name: 'Emily G. Lawson',
    createdAt: new Date('06 April 2024'),
    email: 'emily.lawson@mail.com',
    phone: '(+1)-512-334-7788',
    address: 'Austin/USA',
    ordersCount: 97,
    role: 'Mediator'
  },
  {
    id: '3005',
    image: avatar5,
    name: 'Henry D. Brooks',
    createdAt: new Date('20 April 2024'),
    email: 'henry.brooks@mail.com',
    phone: '(+49)-040-998-3312',
    address: 'Hamburg/Germany',
    ordersCount: 111,
    role: 'Mediator'
  },
  {
    id: '3006',
    image: avatar6,
    name: 'Ava C. Jenkins',
    createdAt: new Date('01 May 2024'),
    email: 'ava.jenkins@mail.com',
    phone: '(+33)-01-673-4411',
    address: 'Lyon/France',
    ordersCount: 134,
    role: 'Mediator'
  },
  {
    id: '3007',
    image: avatar7,
    name: 'William N. Peterson',
    createdAt: new Date('14 May 2024'),
    email: 'william.peterson@mail.com',
    phone: '(+1)-718-562-1199',
    address: 'New York/USA',
    ordersCount: 122,
    role: 'Mediator'
  },
  {
    id: '3008',
    image: avatar8,
    name: 'Ella J. Martinez',
    createdAt: new Date('09 June 2024'),
    email: 'ella.martinez@mail.com',
    phone: '(+34)-91-887-3342',
    address: 'Madrid/Spain',
    ordersCount: 140,
    role: 'Mediator'
  },
  {
    id: '3009',
    image: avatar9,
    name: 'Daniel S. Reed',
    createdAt: new Date('24 July 2024'),
    email: 'daniel.reed@mail.com',
    phone: '(+1)-305-442-3344',
    address: 'Miami/USA',
    ordersCount: 118,
    role: 'Mediator'
  },
  {
    id: '3010',
    image: avatar10,
    name: 'Victoria L. Cooper',
    createdAt: new Date('08 August 2024'),
    email: 'victoria.cooper@mail.com',
    phone: '(+61)-045-992-5566',
    address: 'Perth/Australia',
    ordersCount: 126,
    role: 'Mediator'
  }
]
export const counsellorData =[
  {
    id: '4001',
    image: avatar1,
    name: 'Harper J. Wallace',
    createdAt: new Date('03 March 2024'),
    email: 'harper.wallace@mail.com',
    phone: '(+1)-206-412-9876',
    address: 'Seattle/USA',
    ordersCount: 143,
    role: 'Counsellor'
  },
  {
    id: '4002',
    image: avatar2,
    name: 'Alexander T. Green',
    createdAt: new Date('18 March 2024'),
    email: 'alexander.green@mail.com',
    phone: '(+44)-020-7771-2345',
    address: 'London/UK',
    ordersCount: 101,
    role: 'Counsellor'
  },
  {
    id: '4003',
    image: avatar3,
    name: 'Luna D. Ramirez',
    createdAt: new Date('02 April 2024'),
    email: 'luna.ramirez@mail.com',
    phone: '(+34)-91-667-7788',
    address: 'Barcelona/Spain',
    ordersCount: 152,
    role: 'Counsellor'
  },
  {
    id: '4004',
    image: avatar4,
    name: 'Sebastian R. Howard',
    createdAt: new Date('20 April 2024'),
    email: 'sebastian.howard@mail.com',
    phone: '(+61)-046-234-7766',
    address: 'Sydney/Australia',
    ordersCount: 133,
    role: 'Counsellor'
  },
  {
    id: '4005',
    image: avatar5,
    name: 'Chloe P. Nguyen',
    createdAt: new Date('03 May 2024'),
    email: 'chloe.nguyen@mail.com',
    phone: '(+1)-510-221-7765',
    address: 'San Jose/USA',
    ordersCount: 120,
    role: 'Counsellor'
  },
  {
    id: '4006',
    image: avatar6,
    name: 'Jack K. Mitchell',
    createdAt: new Date('17 May 2024'),
    email: 'jack.mitchell@mail.com',
    phone: '(+49)-030-442-9981',
    address: 'Berlin/Germany',
    ordersCount: 137,
    role: 'Counsellor'
  },
  {
    id: '4007',
    image: avatar7,
    name: 'Ella F. Wright',
    createdAt: new Date('09 June 2024'),
    email: 'ella.wright@mail.com',
    phone: '(+33)-01-665-7733',
    address: 'Paris/France',
    ordersCount: 156,
    role: 'Counsellor'
  },
  {
    id: '4008',
    image: avatar8,
    name: 'Jacob N. Rivera',
    createdAt: new Date('14 July 2024'),
    email: 'jacob.rivera@mail.com',
    phone: '(+1)-407-662-5541',
    address: 'Orlando/USA',
    ordersCount: 148,
    role: 'Counsellor'
  },
  {
    id: '4009',
    image: avatar9,
    name: 'Sofia D. King',
    createdAt: new Date('03 August 2024'),
    email: 'sofia.king@mail.com',
    phone: '(+1)-602-445-6671',
    address: 'Phoenix/USA',
    ordersCount: 171,
    role: 'Counsellor'
  },
  {
    id: '4010',
    image: avatar10,
    name: 'Logan W. Bailey',
    createdAt: new Date('27 August 2024'),
    email: 'logan.bailey@mail.com',
    phone: '(+61)-045-889-5532',
    address: 'Melbourne/Australia',
    ordersCount: 138,
    role: 'Counsellor'
  }
]
export const therapistData =[
  {
    id: '5001',
    image: avatar1,
    name: 'Abigail S. Murphy',
    createdAt: new Date('10 February 2024'),
    email: 'abigail.murphy@mail.com',
    phone: '(+1)-312-442-8876',
    address: 'Chicago/USA',
    ordersCount: 162,
    role: 'Therapist'
  },
  {
    id: '5002',
    image: avatar2,
    name: 'Mason L. Perry',
    createdAt: new Date('22 February 2024'),
    email: 'mason.perry@mail.com',
    phone: '(+44)-020-7733-8899',
    address: 'London/UK',
    ordersCount: 128,
    role: 'Therapist'
  },
  {
    id: '5003',
    image: avatar3,
    name: 'Ella J. Russell',
    createdAt: new Date('08 March 2024'),
    email: 'ella.russell@mail.com',
    phone: '(+33)-01-665-4421',
    address: 'Paris/France',
    ordersCount: 141,
    role: 'Therapist'
  },
  {
    id: '5004',
    image: avatar4,
    name: 'Michael T. Brooks',
    createdAt: new Date('26 March 2024'),
    email: 'michael.brooks@mail.com',
    phone: '(+1)-718-557-2211',
    address: 'New York/USA',
    ordersCount: 173,
    role: 'Therapist'
  },
  {
    id: '5005',
    image: avatar5,
    name: 'Grace P. Simmons',
    createdAt: new Date('15 April 2024'),
    email: 'grace.simmons@mail.com',
    phone: '(+49)-030-441-2278',
    address: 'Berlin/Germany',
    ordersCount: 152,
    role: 'Therapist'
  },
  {
    id: '5006',
    image: avatar6,
    name: 'Carter B. Hayes',
    createdAt: new Date('03 May 2024'),
    email: 'carter.hayes@mail.com',
    phone: '(+61)-041-335-6677',
    address: 'Sydney/Australia',
    ordersCount: 190,
    role: 'Therapist'
  },
  {
    id: '5007',
    image: avatar7,
    name: 'Scarlett F. James',
    createdAt: new Date('27 May 2024'),
    email: 'scarlett.james@mail.com',
    phone: '(+1)-213-882-1199',
    address: 'Los Angeles/USA',
    ordersCount: 178,
    role: 'Therapist'
  },
  {
    id: '5008',
    image: avatar8,
    name: 'Henry R. Powell',
    createdAt: new Date('18 June 2024'),
    email: 'henry.powell@mail.com',
    phone: '(+34)-91-773-8892',
    address: 'Madrid/Spain',
    ordersCount: 159,
    role: 'Therapist'
  },
  {
    id: '5009',
    image: avatar9,
    name: 'Lily E. Hayes',
    createdAt: new Date('09 July 2024'),
    email: 'lily.hayes@mail.com',
    phone: '(+1)-415-667-2299',
    address: 'San Francisco/USA',
    ordersCount: 167,
    role: 'Therapist'
  },
  {
    id: '5010',
    image: avatar10,
    name: 'Owen D. Perry',
    createdAt: new Date('25 August 2024'),
    email: 'owen.perry@mail.com',
    phone: '(+61)-045-778-6632',
    address: 'Melbourne/Australia',
    ordersCount: 134,
    role: 'Therapist'
  }
]


export const ordersData = [
  {
    id: '3001',
    productId: '10001',
    customerId: '2001',
    createdAt: new Date('03/07/2021'),
    paymentMethod: 'Credit Card',
    status: 'Delivered',
  },
  {
    id: '3002',
    productId: '10002',
    customerId: '2002',
    createdAt: new Date('06/09/2018'),
    paymentMethod: 'Credit Card',
    status: 'Processing',
  },
  {
    id: '3003',
    productId: '10003',
    customerId: '2003',
    createdAt: new Date('12/07/2019'),
    paymentMethod: 'Pay Pal',
    status: 'Cancelled',
  },
  {
    id: '3004',
    productId: '10004',
    customerId: '2004',
    createdAt: new Date('01/12/2021'),
    paymentMethod: 'Credit Card',
    status: 'Delivered',
  },
  {
    id: '3005',
    productId: '10005',
    customerId: '2005',
    createdAt: new Date('01/05/2018'),
    paymentMethod: 'Pay Pal',
    status: 'Delivered',
  },
  {
    id: '3006',
    productId: '10006',
    customerId: '2006',
    createdAt: new Date('12/06/2020'),
    paymentMethod: 'Pay Pal',
    status: 'Processing',
  },
  {
    id: '3007',
    productId: '10007',
    customerId: '2007',
    createdAt: new Date('04/08/2017'),
    paymentMethod: 'Credit Card',
    status: 'Processing',
  },
  {
    id: '3008',
    productId: '10003',
    customerId: '2008',
    createdAt: new Date('03/07/2018'),
    paymentMethod: 'Credit Card',
    status: 'Cancelled',
  },
  {
    id: '3009',
    productId: '10002',
    customerId: '2009',
    createdAt: new Date('08/11/2019'),
    paymentMethod: 'Google Pay',
    status: 'Delivered',
  },
  {
    id: '3010',
    productId: '10005',
    customerId: '2010',
    createdAt: new Date('07/03/2019'),
    paymentMethod: 'Google Pay',
    status: 'Processing',
  },
]
export const inventoryData = [{
  id: '4001',
  productId: '10001',
  condition: 'New',
  location: 'WareHouse 1',
  quantity: 3521,
  reserved: 6532,
  onHand: 1236,
  lastModifiedAt: new Date('12/03/2021')
}, {
  id: '4002',
  productId: '10002',
  condition: 'New',
  location: 'WareHouse 2',
  quantity: 4562,
  reserved: 256,
  onHand: 214,
  lastModifiedAt: new Date('06/04/2021')
}, {
  id: '4003',
  productId: '10003',
  condition: 'Returned',
  location: 'WareHouse 3',
  quantity: 125,
  reserved: 4512,
  onHand: 412,
  lastModifiedAt: new Date('21/05/2020')
}, {
  id: '4004',
  productId: '10004',
  condition: 'Damaged',
  location: 'WareHouse 1',
  quantity: 4523,
  reserved: 1241,
  onHand: 852,
  lastModifiedAt: new Date('15/03/2021')
}, {
  id: '4005',
  productId: '10005',
  condition: 'New',
  location: 'WareHouse 2',
  quantity: 1475,
  reserved: 2345,
  onHand: 1256,
  lastModifiedAt: new Date('15/10/2020')
}];
export const invoicesData = [{
  id: 'RB6985',
  productId: '10001',
  customerId: '2001',
  orderId: '3001'
}, {
  id: 'RB1002',
  productId: '10002',
  customerId: '2002',
  orderId: '3002'
}, {
  id: 'RB3652',
  productId: '10003',
  customerId: '2003',
  orderId: '3003'
}, {
  id: 'RB7854',
  productId: '10004',
  customerId: '2004',
  orderId: '3004'
}, {
  id: 'RB9521',
  productId: '10005',
  customerId: '2005',
  orderId: '3005'
}, {
  id: 'RB9634',
  productId: '10006',
  customerId: '2006',
  orderId: '3006'
}, {
  id: 'RB8520',
  productId: '10007',
  customerId: '2007',
  orderId: '3007'
}, {
  id: 'RB3590',
  productId: '10003',
  customerId: '2008',
  orderId: '3008'
}, {
  id: 'RB5872',
  productId: '10005',
  customerId: '2009',
  orderId: '3009'
}, {
  id: 'RB1158',
  productId: '10002',
  customerId: '2010',
  orderId: '3010'
}];