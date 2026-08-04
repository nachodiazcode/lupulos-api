import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const objectId = Joi.string().pattern(objectIdPattern).message('Invalid ObjectId');
const mediaPath = Joi.string().trim().max(2048);

const profileSchema = Joi.object({
  username: Joi.string().trim().min(3).max(40),
  email: Joi.string().email(),
  bio: Joi.string().max(280),
  city: Joi.string().max(80),
  country: Joi.string().max(80),
  profilePicture: mediaPath,
  bannerPicture: mediaPath,
  favoriteStyle: Joi.string().max(80),
  isPublic: Joi.boolean(),
}).min(1);

export const commonValidation = {
  idParam: Joi.object({
    id: objectId.required(),
  }),
  userIdParam: Joi.object({
    userId: objectId.required(),
  }),
  chatIdParam: Joi.object({
    chatId: objectId.required(),
  }),
  postIdParam: Joi.object({
    postId: objectId.required(),
  }),
};

export const authValidation = {
  register: {
    body: Joi.object({
      username: Joi.string().trim().min(3).max(40).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      profilePicture: mediaPath.optional(),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
    }),
  },
  refreshToken: {
    body: Joi.object({
      token: Joi.string().required(),
    }),
  },
  logout: {
    body: Joi.object({
      refreshToken: Joi.string().optional(),
    }),
  },
  profileParams: {
    params: Joi.object({
      userId: objectId.required(),
    }),
  },
};

export const chatValidation = {
  listChats: {
    query: Joi.object({
      type: Joi.string().valid('community', 'b2b', 'ai').optional(),
    }),
  },
  createChat: {
    body: Joi.object({
      targetUserId: objectId.required(),
      chatType: Joi.string().valid('community', 'b2b', 'ai').default('community'),
    }),
  },
  messageList: {
    params: Joi.object({
      chatId: objectId.required(),
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(30),
    }),
  },
  sendMessage: {
    params: Joi.object({
      chatId: objectId.required(),
    }),
    body: Joi.object({
      content: Joi.string().trim().min(1).max(1000).required(),
    }),
  },
  aiQuery: {
    body: Joi.object({
      query: Joi.string().trim().min(1).max(500).required(),
    }),
  },
};

export const subscriptionValidation = {
  subscribe: {
    body: Joi.object({
      plan: Joi.string().valid('lupuloso', 'pro', 'explorer').required(),
      billingCycle: Joi.string().valid('monthly', 'yearly').required(),
    }),
  },
  adminGrant: {
    body: Joi.object({
      userId: objectId.required(),
      plan: Joi.string().valid('lupuloso', 'pro', 'explorer').required(),
      billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
      notes: Joi.string().trim().max(500).allow('').optional(),
    }),
  },
};

export const userValidation = {
  updateProfile: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: profileSchema,
  },
  userIdParam: {
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  changeRole: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      role: Joi.string().valid('user', 'moderator', 'admin').required(),
    }),
  },
  updatePermissions: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      permissions: Joi.array().items(Joi.string().trim()).required(),
    }),
  },
  scopeQuery: {
    query: Joi.object({
      scope: Joi.string().valid('public').optional(),
    }),
  },
};

export const beerValidation = {
  createBeer: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120).required(),
      brewery: Joi.string().trim().min(2).max(120).required(),
      beerStyle: Joi.string().trim().min(2).max(120).required(),
      abv: Joi.number().min(0).max(20).required(),
      description: Joi.string().trim().min(5).max(2000).required(),
      image: mediaPath.optional(),
    }),
  },
  updateBeer: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120),
      brewery: Joi.string().trim().min(2).max(120),
      beerStyle: Joi.string().trim().min(2).max(120),
      abv: Joi.number().min(0).max(20),
      description: Joi.string().trim().min(5).max(2000),
      image: mediaPath,
      video: mediaPath,
    }).min(1),
  },
  reviewBeer: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      comment: Joi.string().trim().min(1).max(1000).required(),
      rating: Joi.number().min(1).max(5).required(),
      video: mediaPath.optional(),
    }),
  },
  beerIdParam: {
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  searchBeers: {
    query: Joi.object({
      name: Joi.string().trim().max(120),
      brewery: Joi.string().trim().max(120),
      beerStyle: Joi.string().trim().max(120),
      minAbv: Joi.number().min(0).max(20),
      maxAbv: Joi.number().min(0).max(20),
    }),
  },
};

export const placeValidation = {
  createPlace: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120).required(),
      description: Joi.string().trim().min(5).max(2000).required(),
      address: Joi.alternatives()
        .try(
          Joi.string().required(),
          Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required(),
            state: Joi.string().trim().required(),
            country: Joi.string().trim().required(),
            postalCode: Joi.string().trim().allow(''),
          }).required()
        )
        .required(),
    }),
  },
  createBulkPlaces: {
    body: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().min(2).max(120).required(),
          description: Joi.string().trim().min(5).max(2000).required(),
          address: Joi.object({
            street: Joi.string().trim().required(),
            city: Joi.string().trim().required(),
            state: Joi.string().trim().required(),
            country: Joi.string().trim().required(),
            postalCode: Joi.string().trim().allow(''),
          }).required(),
        })
      )
      .min(1)
      .required(),
  },
  updatePlace: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      name: Joi.string().trim().min(2).max(120),
      description: Joi.string().trim().min(5).max(2000),
      address: Joi.object({
        street: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        postalCode: Joi.string().trim().allow(''),
      }),
      amenities: Joi.array().items(Joi.string().trim()),
      phone: Joi.string().trim().max(40).allow(''),
      website: Joi.string().trim().uri().allow(''),
      contactEmail: Joi.string().email().allow(''),
      beers: Joi.array().items(objectId),
      promotions: Joi.array().items(
        Joi.object({
          _id: objectId.optional(),
          description: Joi.string().trim().allow(''),
          discountPercent: Joi.number().min(0).max(100).optional(),
          startDate: Joi.date().allow(null).optional(),
          endDate: Joi.date().allow(null).optional(),
        })
      ),
      owner: objectId.allow(null),
      isFeatured: Joi.boolean(),
    }).min(1),
  },
  placeIdParam: {
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  placeReview: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      comment: Joi.string().trim().min(1).max(1000).required(),
      rating: Joi.number().min(1).max(5).required(),
    }),
  },
  placeSearch: {
    query: Joi.object({
      q: Joi.string().trim().min(1).max(120).required(),
    }),
  },
};

export const postValidation = {
  createPost: {
    body: Joi.object({
      title: Joi.string().trim().min(3).max(100),
      titulo: Joi.string().trim().min(3).max(100),
      content: Joi.string().trim().min(1).max(2000),
      contenido: Joi.string().trim().min(1).max(2000),
      images: Joi.array().items(mediaPath).default([]),
      imagenes: Joi.array().items(mediaPath).default([]),
      media: Joi.array()
        .items(
          Joi.object({
            path: mediaPath.required(),
            type: Joi.string().valid('image', 'video').default('image'),
            durationSeconds: Joi.number().min(0).max(720).allow(null),
          })
        )
        .default([]),
    }).custom((value, helpers) => {
      const title = value.title || value.titulo || '';
      const content = value.content || value.contenido || '';
      const images = value.images || [];
      const imagenes = value.imagenes || [];
      const media = value.media || [];

      if (
        !title.trim() &&
        !content.trim() &&
        images.length === 0 &&
        imagenes.length === 0 &&
        media.length === 0
      ) {
        return helpers.error('any.custom', {
          message: 'title, titulo, content, contenido o media es requerido',
        });
      }

      return value;
    }),
  },
  updatePost: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      title: Joi.string().trim().min(3).max(100),
      titulo: Joi.string().trim().min(3).max(100),
      content: Joi.string().trim().min(5).max(2000),
      contenido: Joi.string().trim().min(5).max(2000),
      images: Joi.array().items(mediaPath),
      imagenes: Joi.array().items(mediaPath),
      media: Joi.array().items(
        Joi.object({
          path: mediaPath.required(),
          type: Joi.string().valid('image', 'video').default('image'),
          durationSeconds: Joi.number().min(0).max(720).allow(null),
        })
      ),
    }).min(1),
  },
  postIdParam: {
    params: Joi.object({
      id: objectId.required(),
    }),
  },
  postComment: {
    params: Joi.object({
      postId: objectId.required(),
    }),
    body: Joi.object({
      content: Joi.string().trim().min(1).max(1000).required(),
      parentComment: objectId.optional().allow(null, ''),
    }),
  },
  postCommentsParams: {
    params: Joi.object({
      postId: objectId.required(),
    }),
  },
  postReact: {
    params: Joi.object({
      id: objectId.required(),
    }),
    body: Joi.object({
      type: Joi.string()
        .valid('cheers', 'recommended', 'like', 'meGusta', 'recomendado')
        .required(),
    }),
  },
  pagination: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sort: Joi.string().trim().valid('createdAt', 'updatedAt', 'views').default('createdAt'),
      order: Joi.string().trim().valid('asc', 'desc').default('desc'),
    }),
  },
};
