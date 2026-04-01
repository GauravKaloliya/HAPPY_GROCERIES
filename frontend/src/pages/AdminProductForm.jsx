import { useEffect, useMemo, useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriesAPI } from '../api/categories';
import { productsAPI } from '../api/products';
import { showAdminError, showAdminSuccess, showAdminWarning } from '../utils/adminToasts';

const initialForm = {
  name: '',
  price: '0',
  stock: '0',
  discount_percent: '0',
  description: '',
  tags: '',
  is_featured: false,
  is_new_arrival: false,
  is_active: true,
  image_url: '',
  category_id: '',
};

const ADMIN_ALLOWED_CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages'];

const parseTags = (value) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

const KNOWN_GROCERY_TERMS = [
  'apple', 'banana', 'orange', 'grape', 'grapes', 'strawberry', 'watermelon', 'mango',
  'pineapple', 'kiwi', 'papaya', 'guava', 'pomegranate', 'blueberry', 'blackberry',
  'raspberry', 'cranberry', 'mulberry', 'gooseberry', 'peach', 'cherry', 'apricot',
  'plum', 'pear', 'lychee', 'litchi', 'fig', 'date', 'dates', 'melon', 'muskmelon',
  'cantaloupe', 'honeydew', 'coconut', 'avocado', 'lemon', 'lime', 'sweetlime',
  'mosambi', 'mandarin', 'tangerine', 'clementine', 'pomelo', 'grapefruit', 'dragon',
  'dragonfruit', 'fruit', 'jackfruit', 'durian', 'passionfruit', 'starfruit', 'persimmon',
  'nectarine', 'quince', 'currant', 'longan', 'rambutan', 'sapota', 'chikoo',
  'sitaphal', 'custardapple', 'olive', 'prune', 'raisin', 'raisins', 'berry', 'berries',
  'carrot', 'tomato', 'broccoli', 'cucumber', 'potato', 'corn', 'spinach', 'cauliflower',
  'cabbage', 'onion', 'garlic', 'pepper', 'capsicum', 'peas', 'beans', 'mushroom',
  'eggplant', 'aubergine', 'brinjal', 'bringle', 'bringal', 'lettuce', 'ginger',
  'beetroot', 'beet', 'radish', 'turnip', 'zucchini', 'courgette', 'pumpkin', 'squash',
  'bottle', 'gourd', 'ridgegourd', 'snakegourd', 'bittergourd', 'bittermelon', 'lauki',
  'tinda', 'parwal', 'clusterbeans', 'okra', 'ladyfinger', 'drumstick', 'moringa',
  'celery', 'asparagus', 'artichoke', 'leek', 'shallot', 'scallion', 'springonion',
  'fennel', 'parsley', 'coriander', 'cilantro', 'mint', 'basil', 'dill', 'thyme',
  'rosemary', 'sage', 'curryleaf', 'fenugreek', 'methi', 'arugula', 'rocket', 'bokchoy',
  'kale', 'collard', 'mustardgreens', 'chard', 'watercress', 'yam', 'sweetpotato',
  'cassava', 'tapioca', 'lotus', 'root', 'jicama', 'edamame', 'soybean', 'chickpea',
  'chickpeas', 'sprouts', 'microgreens', 'jalapeno', 'serrano', 'habanero', 'chilli', 'chili',
  'milk', 'curd', 'yogurt', 'yoghurt', 'paneer', 'cheese', 'butter', 'ghee', 'cream',
  'malai', 'buttermilk', 'lassi', 'kefir', 'icecream', 'creamcheese', 'mozzarella',
  'cheddar', 'parmesan', 'gouda', 'brie', 'feta', 'ricotta', 'camembert', 'provolone',
  'havarti', 'mascarpone', 'sourcream', 'whippedcream', 'condensedmilk',
  'evaporatedmilk', 'skimmedmilk', 'fullcream', 'dairy',
  'bread', 'bun', 'toast', 'bagel', 'croissant', 'roll', 'rolls', 'pav', 'baguette',
  'sourdough', 'naan', 'kulcha', 'roti', 'chapati', 'paratha', 'tortilla', 'wrap',
  'muffin', 'cupcake', 'cake', 'brownie', 'brownies', 'pastry', 'donut', 'doughnut',
  'cookie', 'cookies', 'biscuit', 'biscuits', 'cracker', 'crackers', 'rusk', 'khari',
  'breadstick', 'breadsticks', 'crouton', 'croutons', 'pita', 'focaccia', 'ciabatta',
  'pretzel', 'waffle', 'pancake', 'crepe', 'pie', 'tart',
  'rice', 'dal', 'pulse', 'lentil', 'lentils', 'moong', 'toor', 'urad', 'masoor',
  'chana', 'rajma', 'lobia', 'quinoa', 'oats', 'oatmeal', 'barley', 'millet', 'ragi',
  'jowar', 'bajra', 'semolina', 'suji', 'rava', 'poha', 'vermicelli', 'sevai', 'sago',
  'sabudana', 'flour', 'atta', 'maida', 'besan', 'cornflour', 'starch', 'breadcrumbs',
  'cereal', 'muesli', 'granola', 'flakes', 'bran', 'porridge', 'seed', 'seeds',
  'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 'pistachio', 'pistachios',
  'peanut', 'peanuts', 'hazelnut', 'hazelnuts', 'pecan', 'pecans', 'macadamia', 'chia',
  'flax', 'sunflower', 'pumpkinseed', 'sesame',
  'juice', 'coffee', 'tea', 'smoothie', 'shake', 'cola', 'soda', 'drink', 'beverage',
  'water', 'sparklingwater', 'mineralwater', 'coconutwater', 'lemonade', 'icedtea',
  'greentea', 'blacktea', 'herbaltea', 'matcha', 'espresso', 'latte', 'cappuccino',
  'americano', 'mocha', 'filtercoffee', 'coldbrew', 'milkshake', 'proteinshake',
  'energy', 'sportsdrink', 'kombucha', 'mocktail', 'squashdrink', 'syrup',
  'jam', 'jelly', 'marmalade', 'honey', 'spread', 'peanutbutter', 'nutella', 'chocolate',
  'cocoa', 'sauce', 'ketchup', 'mayonnaise', 'mustard', 'vinaigrette', 'dip', 'pickle',
  'chutney', 'relish', 'soy', 'vinegar', 'oil', 'oliveoil', 'sunfloweroil', 'mustardoil',
  'coconutoil', 'sesameoil', 'groundnutoil', 'spice', 'spices', 'masala', 'turmeric',
  'cumin', 'jeera', 'corianderpowder', 'garammasala', 'paprika', 'oregano', 'seasoning',
  'salt', 'sugar', 'jaggery', 'sweetener', 'molasses',
  'chips', 'nachos', 'popcorn', 'namkeen', 'sev', 'bhujia', 'mixture', 'trailmix',
  'snack', 'snacks', 'granolabars', 'proteinbar', 'energybar', 'wafer', 'dessert',
  'pudding', 'custardmix', 'jellymix',
  'salad', 'noodles', 'pasta', 'pizza', 'burger', 'sandwich', 'sandwiches', 'noodle',
  'spaghetti', 'macaroni', 'penne', 'fusilli', 'lasagna', 'ramen', 'udon', 'soup',
  'broth', 'stockcube', 'frozenmeal', 'readymeal', 'meal', 'meals',
  'egg', 'eggs', 'fish', 'chicken', 'meat', 'mutton', 'beef', 'prawn', 'shrimp',
  'crab', 'lobster', 'salmon', 'tuna', 'sardine', 'anchovy', 'basa', 'tilapia',
  'sausage', 'bacon', 'ham', 'salami', 'pepperoni', 'turkey', 'duck', 'lamb',
  'mince', 'keema', 'cutlet', 'fillet', 'drumette',
];

const COMMON_PRODUCT_WORDS = new Set([
  'fresh', 'organic', 'premium', 'whole', 'sliced', 'dried', 'frozen', 'roasted', 'salted',
  'spicy', 'sweet', 'ripe', 'raw', 'green', 'red', 'yellow', 'black', 'white', 'brown',
  'small', 'large', 'mini', 'mix', 'plain', 'classic', 'natural', 'local', 'farm',
  'homestyle', 'special', 'speciality', 'best', 'select', 'choice', 'daily', 'pure',
  'healthy', 'health', 'quality', 'deluxe', 'value', 'lite', 'light', 'extra', 'super',
  'ultra', 'gold', 'silver', 'family', 'economy', 'combo', 'pack', 'box', 'jar',
  'bottle', 'can', 'pouch', 'piece', 'pieces', 'cut', 'washed', 'peeled', 'chopped',
  'diced', 'crushed', 'ground', 'powder', 'powdered', 'instant', 'quick', 'easy',
  'homemade', 'traditional', 'authentic', 'signature', 'tasty', 'delicious', 'yummy',
  'hot', 'cold', 'warm', 'cool', 'seasonal', 'imported', 'desi', 'fine', 'original',
  'real', 'veg', 'veggie', 'vegetarian', 'nonveg', 'boneless', 'skinless', 'freshly',
  'soft', 'crispy', 'crunchy', 'juicy', 'tender', 'thick', 'thin', 'long', 'short',
  'round', 'square', 'mixed', 'assorted', 'assortment', 'flavored', 'flavour',
  'flavoured', 'unsalted', 'sweetened', 'unsweetened', 'diet', 'zero', 'sugarfree',
  'lowfat', 'fullfat', 'highprotein', 'multigrain', 'glutenfree', 'vegan',
]);

const normalizeProductName = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const getProductNameSuggestions = (value) => {
  const normalized = normalizeProductName(value);
  const tokens = normalized
    .split(' ')
    .filter((token) => token.length >= 3 && !COMMON_PRODUCT_WORDS.has(token));

  const scores = KNOWN_GROCERY_TERMS
    .map((candidate) => {
      const best = tokens.reduce((max, token) => {
        let matches = 0;
        const shorter = Math.min(token.length, candidate.length);
        for (let index = 0; index < shorter; index += 1) {
          if (token[index] === candidate[index]) {
            matches += 1;
          }
        }
        return Math.max(max, matches / Math.max(token.length, candidate.length));
      }, 0);
      return { candidate, score: best };
    })
    .filter((item) => item.score >= 0.5)
    .sort((a, b) => b.score - a.score);

  return [...new Set(scores.map((item) => item.candidate))]
    .slice(0, 3)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1));
};

const validateProductNameQuality = (value) => {
  const normalized = normalizeProductName(value);
  const tokens = normalized.split(' ').filter(Boolean);
  const meaningfulTokens = tokens.filter(
    (token) => token.length >= 3 && !COMMON_PRODUCT_WORDS.has(token),
  );

  if (meaningfulTokens.some((token) => token.length >= 3 && new Set(token).size === 1)) {
    const suggestions = getProductNameSuggestions(value);
    if (suggestions.length) {
      return `That product name looks misspelled. Try: ${suggestions.join(', ')}.`;
    }
    return 'That product name does not look like a real grocery item. Please check the spelling.';
  }

  if (
    meaningfulTokens.length
    && meaningfulTokens.every((token) => !KNOWN_GROCERY_TERMS.includes(token))
  ) {
    const suggestions = getProductNameSuggestions(value);
    if (suggestions.length) {
      return `I could not verify that product name. Did you mean: ${suggestions.join(', ')}?`;
    }
    if (meaningfulTokens.length === 1 && meaningfulTokens[0].length >= 4) {
      return 'This does not look like a valid grocery product name. Please correct the spelling.';
    }
  }

  return '';
};

const inferExpectedCategory = (productName) => {
  const value = productName.trim().toLowerCase();

  if (!value) {
    return null;
  }

  const categoryKeywords = {
    Fruits: [
      'dragon fruit',
      'dragonfruit',
      'apple',
      'banana',
      'orange',
      'grape',
      'grapes',
      'strawberry',
      'watermelon',
      'mango',
      'pineapple',
      'kiwi',
      'papaya',
      'guava',
      'pomegranate',
      'blueberry',
      'peach',
      'cherry',
      'avocado',
      'pear',
      'lemon',
      'lime',
      'coconut',
      'melon',
    ],
    Vegetables: [
      'carrot',
      'tomato',
      'broccoli',
      'cucumber',
      'potato',
      'corn',
      'spinach',
      'cauliflower',
      'cabbage',
      'onion',
      'garlic',
      'bell pepper',
      'capsicum',
      'sweet potato',
      'peas',
      'beans',
      'mushroom',
      'eggplant',
      'brinjal',
      'lettuce',
    ],
  };

  for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => value.includes(keyword))) {
      return categoryName;
    }
  }

  return null;
};

const validateHttpUrl = (value) => {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsedUrl = new URL(value);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

const validateProductForm = (formData, categories = []) => {
  const errors = {};
  const trimmedName = formData.name.trim();
  const trimmedDescription = formData.description.trim();
  const parsedTags = parseTags(formData.tags);

  if (!trimmedName) {
    errors.name = 'Product name is required.';
  } else if (trimmedName.length < 3) {
    errors.name = 'Product name must be at least 3 characters.';
  } else if (trimmedName.length > 150) {
    errors.name = 'Product name cannot exceed 150 characters.';
  } else if (!/^[a-zA-Z0-9\s&().,'/-]+$/.test(trimmedName)) {
    errors.name = 'Use only letters, numbers, spaces, and basic punctuation.';
  } else {
    const qualityError = validateProductNameQuality(trimmedName);
    if (qualityError) {
      errors.name = qualityError;
    }
  }

  const priceValue = Number(formData.price);
  if (formData.price === '' || Number.isNaN(priceValue)) {
    errors.price = 'Price is required.';
  } else if (priceValue < 0) {
    errors.price = 'Price cannot be negative.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
    errors.price = 'Price can have at most 2 decimal places.';
  }

  const stockValue = Number(formData.stock);
  if (formData.stock === '' || Number.isNaN(stockValue)) {
    errors.stock = 'Stock is required.';
  } else if (stockValue < 0) {
    errors.stock = 'Stock cannot be negative.';
  } else if (!Number.isInteger(stockValue)) {
    errors.stock = 'Stock must be a whole number.';
  } else if (stockValue > 999999) {
    errors.stock = 'Stock is too large.';
  }

  const discountValue = Number(formData.discount_percent);
  if (formData.discount_percent === '' || Number.isNaN(discountValue)) {
    errors.discount_percent = 'Discount percent is required.';
  } else if (discountValue < 0) {
    errors.discount_percent = 'Discount percent cannot be negative.';
  } else if (!Number.isInteger(discountValue)) {
    errors.discount_percent = 'Discount percent must be a whole number.';
  } else if (discountValue > 100) {
    errors.discount_percent = 'Discount percent cannot be more than 100.';
  }

  if (!formData.category_id) {
    errors.category_id = 'Category is required.';
  }

  const expectedCategory = inferExpectedCategory(trimmedName);
  const selectedCategory = categories.find(
    (category) => String(category.id) === String(formData.category_id),
  );
  const selectedCategoryName = selectedCategory?.name?.trim();

  if (
    expectedCategory
    && selectedCategoryName
    && selectedCategoryName.toLowerCase() !== expectedCategory.toLowerCase()
  ) {
    errors.category_id = `"${trimmedName}" belongs in "${expectedCategory}", not "${selectedCategoryName}".`;
  }

  if (!trimmedDescription) {
    errors.description = 'Description is required.';
  } else if (trimmedDescription.length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  } else if (trimmedDescription.length > 1000) {
    errors.description = 'Description cannot exceed 1000 characters.';
  }

  if (parsedTags.length > 10) {
    errors.tags = 'You can add up to 10 tags only.';
  } else if (parsedTags.some((tag) => tag.length > 30)) {
    errors.tags = 'Each tag must be 30 characters or fewer.';
  } else if (parsedTags.some((tag) => !/^[a-zA-Z0-9\s-]+$/.test(tag))) {
    errors.tags = 'Tags can use letters, numbers, spaces, and hyphens only.';
  }

  if (!validateHttpUrl(formData.image_url)) {
    errors.image_url = 'Image URL must start with http:// or https://.';
  } else if (formData.image_url.trim().length > 512) {
    errors.image_url = 'Image URL cannot exceed 512 characters.';
  }

  return errors;
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const storageKey = useMemo(
    () => (isEditMode ? `admin-product-form:${id}` : 'admin-product-form:new'),
    [id, isEditMode],
  );
  const draftLoadedRef = useRef(false);
  const [formData, setFormData] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => validateProductForm(formData, categories), [categories, formData]);
  const isFormValid = Object.keys(errors).length === 0;

  useEffect(() => {
    let active = true;

    const loadDependencies = async () => {
      try {
        const categoriesResponse = await categoriesAPI.getAll();
        const categoryList = (categoriesResponse.data?.results || categoriesResponse.data || [])
          .filter((category) => ADMIN_ALLOWED_CATEGORIES.includes(category.name));
        const savedDraftRaw = sessionStorage.getItem(storageKey);
        let savedDraft = null;

        if (savedDraftRaw) {
          try {
            savedDraft = JSON.parse(savedDraftRaw);
          } catch {
            sessionStorage.removeItem(storageKey);
          }
        }

        let nextForm = {
          ...initialForm,
          category_id: categoryList[0]?.id?.toString() || '',
        };

        if (isEditMode) {
          const productResponse = await productsAPI.getById(id);
          const product = productResponse.data;
          nextForm = {
            name: product.name || '',
            price: String(product.price ?? 0),
            stock: String(product.stock ?? 0),
            discount_percent: String(product.discount_percent ?? 0),
            description: product.description || '',
            tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
            is_featured: Boolean(product.is_featured),
            is_new_arrival: Boolean(product.is_new_arrival),
            is_active: Boolean(product.is_active),
            image_url: product.image_url || '',
            category_id: String(product.category?.id || categoryList[0]?.id || ''),
          };
        }

        if (savedDraft) {
          nextForm = {
            ...nextForm,
            ...savedDraft,
          };
        }

        if (active) {
          setCategories(categoryList);
          setFormData(nextForm);
          draftLoadedRef.current = true;
        }
      } catch {
        showAdminError('Unable to load product form');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDependencies();

    return () => {
      active = false;
    };
  }, [id, isEditMode, storageKey]);

  useEffect(() => {
    if (!draftLoadedRef.current || loading) {
      return;
    }

    sessionStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, loading, storageKey]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({
      ...current,
      [name]: true,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!isFormValid) {
      if (errors.name) {
        showAdminWarning(errors.name);
      }
      showAdminError('Please complete all validations before submitting.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price || 0),
        stock: Number(formData.stock || 0),
        discount_percent: Number(formData.discount_percent || 0),
        category_id: Number(formData.category_id),
        tags: parseTags(formData.tags),
        image_url: formData.image_url.trim() || null,
      };

      if (isEditMode) {
        await productsAPI.update(id, payload);
        showAdminSuccess('Product updated successfully');
      } else {
        await productsAPI.create(payload);
        showAdminSuccess('Product added successfully');
      }

      sessionStorage.removeItem(storageKey);
      navigate('/admin', { replace: true });
    } catch (error) {
      const detail = error.response?.data?.detail;
      showAdminError(detail || 'Unable to save product');
    } finally {
      setSaving(false);
    }
  };

  const shouldShowError = (fieldName) => submitAttempted || touched[fieldName];

  if (loading) {
    return (
      <div className="admin-loading-panel">
        <div className="admin-primary-spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <section className="admin-form-page">
      <div className="admin-form-header">
        <div className="admin-heading-block">
          <p className="admin-eyebrow">{isEditMode ? 'Edit product' : 'Add product'}</p>
          <h1>{isEditMode ? 'Update Product' : 'Create Product'}</h1>
        </div>
      </div>

      <form className="admin-product-form" onSubmit={handleSubmit}>
        <div className="admin-form-grid">
          <label>
            Product name
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Fresh Apples"
              maxLength="150"
              aria-invalid={shouldShowError('name') && errors.name ? 'true' : 'false'}
              required
            />
            {shouldShowError('name') && errors.name ? <span className="admin-field-error">{errors.name}</span> : null}
          </label>

          <label>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0.00"
              aria-invalid={shouldShowError('price') && errors.price ? 'true' : 'false'}
              required
            />
            {shouldShowError('price') && errors.price ? <span className="admin-field-error">{errors.price}</span> : null}
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={shouldShowError('stock') && errors.stock ? 'true' : 'false'}
              required
            />
            {shouldShowError('stock') && errors.stock ? <span className="admin-field-error">{errors.stock}</span> : null}
          </label>

          <label>
            Discount percent
            <input
              name="discount_percent"
              type="number"
              min="0"
              step="1"
              value={formData.discount_percent}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0"
              aria-invalid={shouldShowError('discount_percent') && errors.discount_percent ? 'true' : 'false'}
              required
            />
            {shouldShowError('discount_percent') && errors.discount_percent ? (
              <span className="admin-field-error">{errors.discount_percent}</span>
            ) : null}
          </label>

          <label className="admin-select-field">
            Category
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={shouldShowError('category_id') && errors.category_id ? 'true' : 'false'}
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {shouldShowError('category_id') && errors.category_id ? (
              <span className="admin-field-error">{errors.category_id}</span>
            ) : null}
          </label>

          <label>
            Image URL (optional)
            <input
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="https://example.com/product.jpg"
              maxLength="512"
              aria-invalid={shouldShowError('image_url') && errors.image_url ? 'true' : 'false'}
            />
            {shouldShowError('image_url') && errors.image_url ? (
              <span className="admin-field-error">{errors.image_url}</span>
            ) : null}
          </label>

          <label>
            Tags
            <input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="fresh, organic, seasonal"
              maxLength="320"
              aria-invalid={shouldShowError('tags') && errors.tags ? 'true' : 'false'}
            />
            {shouldShowError('tags') && errors.tags ? <span className="admin-field-error">{errors.tags}</span> : null}
          </label>
        </div>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Write a clear product description"
            rows="6"
            maxLength="1000"
            aria-invalid={shouldShowError('description') && errors.description ? 'true' : 'false'}
          />
          {shouldShowError('description') && errors.description ? (
            <span className="admin-field-error">{errors.description}</span>
          ) : null}
        </label>

        <div className="admin-toggle-grid">
          <label className="admin-checkbox-field">
            <span>Mark as featured</span>
            <input
              name="is_featured"
              type="checkbox"
              checked={formData.is_featured}
              onChange={handleChange}
            />
          </label>

          <label className="admin-checkbox-field">
            <span>Mark as new arrival</span>
            <input
              name="is_new_arrival"
              type="checkbox"
              checked={formData.is_new_arrival}
              onChange={handleChange}
            />
          </label>

          <label className="admin-checkbox-field">
            <span>Keep product active</span>
            <input
              name="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange}
            />
          </label>
        </div>

        <button type="submit" className="admin-save-btn" disabled={saving || !isFormValid}>
          <Save size={16} />
          {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
        </button>
      </form>
    </section>
  );
};

export default AdminProductForm;
