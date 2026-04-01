import difflib
import re
from decimal import Decimal
from rest_framework import serializers
from django.db.models import Max

from .models import Category, Product, ProductVariant, infer_product_emoji, infer_product_category_name


KNOWN_GROCERY_TERMS = {
    'apple', 'banana', 'orange', 'grape', 'grapes', 'strawberry', 'watermelon', 'mango',
    'pineapple', 'kiwi', 'papaya', 'guava', 'pomegranate', 'blueberry', 'blackberry',
    'raspberry', 'cranberry', 'mulberry', 'gooseberry', 'peach', 'cherry', 'apricot',
    'plum', 'pear', 'lychee', 'litchi', 'fig', 'date', 'dates', 'melon', 'muskmelon',
    'cantaloupe', 'honeydew', 'coconut', 'avocado', 'lemon', 'lime', 'sweetlime',
    'mosambi', 'mandarin', 'tangerine', 'clementine', 'pomelo', 'grapefruit', 'dragon',
    'dragonfruit', 'fruit', 'jackfruit', 'durian', 'passionfruit', 'starfruit', 'persimmon',
    'nectarine', 'quince', 'currant', 'jabuticaba', 'longan', 'rambutan', 'sapota',
    'chikoo', 'sitaphal', 'custardapple', 'custard', 'applepear', 'olive', 'prune',
    'raisin', 'raisins', 'sultana', 'berry', 'berries',
    'carrot', 'tomato', 'broccoli', 'cucumber', 'potato', 'corn', 'spinach', 'cauliflower',
    'cabbage', 'onion', 'garlic', 'pepper', 'capsicum', 'peas', 'beans', 'mushroom',
    'eggplant', 'aubergine', 'brinjal', 'bringle', 'bringal', 'lettuce', 'ginger',
    'beetroot', 'beet', 'radish', 'turnip', 'zucchini', 'courgette', 'pumpkin', 'squash',
    'bottle', 'gourd', 'ridgegourd', 'snakegourd', 'bittergourd', 'bittermelon', 'lauki',
    'tinda', 'parwal', 'clusterbeans', 'okra', 'ladyfinger', 'drumstick', 'moringa',
    'celery', 'asparagus', 'artichoke', 'leek', 'shallot', 'scallion', 'springonion',
    'fennel', 'parsley', 'coriander', 'cilantro', 'mint', 'basil', 'dill', 'thyme',
    'rosemary', 'oregano', 'sage', 'curryleaf', 'fenugreek', 'methi', 'arugula', 'rocket',
    'bokchoy', 'pakchoi', 'kale', 'collard', 'mustardgreens', 'chard', 'watercress',
    'endive', 'radicchio', 'turnipgreens', 'yam', 'sweetpotato', 'cassava', 'tapioca',
    'lotus', 'root', 'jicama', 'edamame', 'soybean', 'chickpea', 'chickpeas', 'sprouts',
    'microgreens', 'jalapeno', 'serrano', 'habanero', 'chilli', 'chili',
    'milk', 'curd', 'yogurt', 'yoghurt', 'paneer', 'cheese', 'butter', 'ghee', 'cream',
    'malai', 'buttermilk', 'lassi', 'kefir', 'custard', 'icecream', 'ice', 'creamcheese',
    'mozzarella', 'cheddar', 'parmesan', 'gouda', 'brie', 'feta', 'ricotta', 'camembert',
    'provolone', 'havarti', 'mascarpone', 'sourcream', 'whippedcream', 'condensedmilk',
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
    'peanut', 'peanuts', 'hazelnut', 'hazelnuts', 'pecan', 'pecans', 'macadamia',
    'chia', 'flax', 'sunflower', 'pumpkinseed', 'sesame',
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
    'snack', 'snacks', 'cracker', 'granolabars', 'proteinbar', 'energybar', 'wafer',
    'dessert', 'pudding', 'custardmix', 'jellymix',
    'salad', 'noodles', 'pasta', 'pizza', 'burger', 'sandwich', 'sandwiches', 'noodle',
    'spaghetti', 'macaroni', 'penne', 'fusilli', 'lasagna', 'ramen', 'udon', 'soup',
    'broth', 'stockcube', 'frozenmeal', 'readymeal', 'meal', 'meals',
    'egg', 'eggs', 'fish', 'chicken', 'meat', 'mutton', 'beef', 'prawn', 'shrimp',
    'crab', 'lobster', 'salmon', 'tuna', 'sardine', 'anchovy', 'basa', 'tilapia',
    'sausage', 'bacon', 'ham', 'salami', 'pepperoni', 'turkey', 'duck', 'lamb',
    'mince', 'keema', 'cutlet', 'fillet', 'drumette',
}

COMMON_PRODUCT_WORDS = {
    'fresh', 'organic', 'premium', 'whole', 'sliced', 'dried', 'frozen', 'roasted', 'salted',
    'spicy', 'sweet', 'ripe', 'raw', 'green', 'red', 'yellow', 'black', 'white', 'brown',
    'small', 'large', 'mini', 'mix', 'plain', 'classic', 'natural', 'local', 'farm',
    'homestyle', 'special', 'speciality', 'best', 'select', 'choice', 'daily', 'pure',
    'healthy', 'health', 'quality', 'deluxe', 'value', 'lite', 'light', 'extra', 'super',
    'ultra', 'gold', 'silver', 'family', 'economy', 'combo', 'pack', 'box', 'jar',
    'bottle', 'can', 'pouch', 'piece', 'pieces', 'cut', 'washed', 'peeled', 'chopped',
    'diced', 'crushed', 'ground', 'powder', 'powdered', 'instant', 'quick', 'easy',
    'homemade', 'homestyle', 'traditional', 'authentic', 'signature', 'special', 'tasty',
    'delicious', 'yummy', 'hot', 'cold', 'warm', 'cool', 'seasonal', 'dailyfresh',
    'imported', 'export', 'desi', 'premiumquality', 'top', 'fine', 'original', 'real',
    'veg', 'veggie', 'vegetarian', 'nonveg', 'boneless', 'skinless', 'freshly', 'soft',
    'crispy', 'crunchy', 'juicy', 'tender', 'thick', 'thin', 'long', 'short', 'round',
    'square', 'mixed', 'assorted', 'assortment', 'flavored', 'flavour', 'flavoured',
    'unsalted', 'salted', 'sweetened', 'unsweetened', 'diet', 'zero', 'sugarfree',
    'lowfat', 'fullfat', 'highprotein', 'multigrain', 'glutenfree', 'vegan',
}


def _normalize_product_name(value):
    return re.sub(r'[^a-z0-9]+', ' ', (value or '').lower()).strip()


def suggest_product_name_terms(value):
    tokens = [
        token for token in _normalize_product_name(value).split()
        if len(token) >= 3 and token not in COMMON_PRODUCT_WORDS
    ]
    suggestions = []
    for token in tokens:
        if token in KNOWN_GROCERY_TERMS:
            continue
        suggestions.extend(difflib.get_close_matches(token, sorted(KNOWN_GROCERY_TERMS), n=3, cutoff=0.72))

    unique = []
    for suggestion in suggestions:
        label = suggestion.title()
        if label not in unique:
            unique.append(label)
    return unique[:3]


def validate_product_name_quality(value):
    normalized = _normalize_product_name(value)
    tokens = normalized.split()
    alpha_tokens = [token for token in tokens if token.isalpha()]
    meaningful_tokens = [
        token for token in alpha_tokens
        if len(token) >= 3 and token not in COMMON_PRODUCT_WORDS
    ]

    if any(len(set(token)) == 1 and len(token) >= 3 for token in meaningful_tokens):
        suggestions = suggest_product_name_terms(value)
        if suggestions:
            joined = ', '.join(suggestions)
            raise serializers.ValidationError(f'This name looks misspelled. Try: {joined}.')
        raise serializers.ValidationError(
            'This product name does not look like a real grocery item. Please check the spelling.'
        )

    if meaningful_tokens and all(token not in KNOWN_GROCERY_TERMS for token in meaningful_tokens):
        suggestions = suggest_product_name_terms(value)
        if suggestions:
            joined = ', '.join(suggestions)
            raise serializers.ValidationError(f'We could not verify this product name. Did you mean: {joined}?')

        if len(meaningful_tokens) == 1 and len(meaningful_tokens[0]) >= 4:
            raise serializers.ValidationError(
                'This product name does not look like a valid grocery product. Please check the spelling.'
            )


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'emoji', 'parent', 'display_order', 'is_visible']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'sku',
            'variant_name',
            'price',
            'stock_quantity',
            'low_stock_threshold',
            'weight',
            'unit_type',
            'unit_value',
            'is_default',
        ]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_deleted=False),
        source='category',
        write_only=True,
        required=False,
    )
    variants = serializers.SerializerMethodField()
    default_variant = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    stock = serializers.IntegerField(read_only=True)
    effective_price = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    emoji = serializers.CharField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'category',
            'category_id',
            'description',
            'search_keywords',
            'tags',
            'attributes',
            'price',
            'stock',
            'effective_price',
            'discount_amount',
            'rating',
            'reviews_count',
            'emoji',
            'discount_percent',
            'is_featured',
            'is_new_arrival',
            'is_active',
            'image_url',
            'default_variant',
            'variants',
        ]
        read_only_fields = ['id', 'reviews_count', 'rating']

    def get_variants(self, obj):
        variants = obj.variants.filter(is_deleted=False).order_by('-is_default', 'id')
        return ProductVariantSerializer(variants, many=True).data

    def get_default_variant(self, obj):
        variant = obj.default_variant
        if not variant:
            return None
        return ProductVariantSerializer(variant).data

    def get_effective_price(self, obj):
        return obj.effective_price

    def get_discount_amount(self, obj):
        return obj.discount_amount


class AdminProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.filter(is_deleted=False),
        source='category',
        write_only=True,
    )
    emoji = serializers.CharField(source='emoji_db', required=False, allow_blank=True, trim_whitespace=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, source='price_db')
    stock = serializers.IntegerField(source='stock_db', required=False)
    discount_percent = serializers.IntegerField(source='discount_percent_db', required=False, min_value=0)
    tags = serializers.ListField(
        child=serializers.CharField(allow_blank=False),
        required=False,
        allow_empty=True,
    )
    image_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'emoji',
            'image_url',
            'price',
            'stock',
            'discount_percent',
            'tags',
            'is_featured',
            'is_new_arrival',
            'category',
            'category_id',
            'is_active',
            'is_deleted',
            'deleted_at',
        ]
        read_only_fields = ['id', 'is_deleted', 'deleted_at']

    def _resolve_emoji_value(self, name, category, raw_emoji='', description='', tags=None):
        emoji = (raw_emoji or '').strip()
        if emoji and emoji != '🛒':
            return emoji

        inferred = infer_product_emoji(name, description, tags)
        if inferred != '🛒':
            return inferred

        category_emoji = getattr(category, 'emoji', '') if category else ''
        if category_emoji:
            return category_emoji

        return '🛒'

    def validate_emoji(self, value):
        emoji = (value or '').strip()
        if emoji and len(emoji) > 10:
            raise serializers.ValidationError('Product emoji must be 10 characters or fewer.')
        return emoji

    def validate_name(self, value):
        trimmed = (value or '').strip()
        validate_product_name_quality(trimmed)
        return trimmed

    def validate(self, attrs):
        attrs = super().validate(attrs)

        next_name = attrs.get('name')
        if next_name is None and self.instance is not None:
            next_name = self.instance.name

        next_category = attrs.get('category')
        if next_category is None and self.instance is not None:
            next_category = self.instance.category

        expected_category_name = infer_product_category_name(next_name)
        actual_category_name = (getattr(next_category, 'name', '') or '').strip()

        if (
            expected_category_name
            and actual_category_name
            and actual_category_name.lower() != expected_category_name.lower()
        ):
            raise serializers.ValidationError(
                {
                    'category_id': (
                        f'"{next_name}" should be in "{expected_category_name}", '
                        f'not "{actual_category_name}".'
                    )
                }
            )

        return attrs

    def _build_default_sku(self, product_id):
        base_sku = f"SKU-P{product_id}-DEFAULT"
        if not ProductVariant.objects.filter(sku=base_sku).exists():
            return base_sku

        counter = 1
        while True:
            candidate = f"{base_sku}-{counter}"
            if not ProductVariant.objects.filter(sku=candidate).exists():
                return candidate
            counter += 1

    def _sync_default_variant(self, product):
        active_variants = product.variants.filter(is_deleted=False).order_by('-is_default', 'id')
        default_variant = active_variants.filter(is_default=True).first() or active_variants.first()
        price = product.price_db or Decimal('0')
        stock = int(product.stock_db or 0)

        if default_variant is None:
            default_variant = ProductVariant.objects.create(
                product=product,
                sku=self._build_default_sku(product.id),
                variant_name='Default',
                price=price,
                stock_quantity=stock,
                low_stock_threshold=10,
                weight=None,
                unit_type='piece',
                unit_value=Decimal('1.000'),
                is_default=True,
            )
        else:
            default_variant.price = price
            default_variant.stock_quantity = stock
            default_variant.is_default = True
            default_variant.save(update_fields=['price', 'stock_quantity', 'is_default', 'updated_at'])

        product.variants.filter(is_deleted=False).exclude(id=default_variant.id).update(is_default=False)

    def create(self, validated_data):
        max_id = Product.objects.aggregate(max_id=Max('id')).get('max_id') or 0
        validated_data.setdefault('id', max_id + 1)
        validated_data.setdefault('stock_db', 0)
        validated_data.setdefault('discount_percent_db', 0)
        validated_data.setdefault('is_active', True)
        validated_data.setdefault('is_deleted', False)
        validated_data.setdefault('search_keywords', [])
        validated_data.setdefault('tags', [])
        validated_data.setdefault('attributes', {})
        validated_data['emoji_db'] = self._resolve_emoji_value(
            validated_data.get('name', ''),
            validated_data.get('category'),
            validated_data.get('emoji_db', ''),
            validated_data.get('description', ''),
            validated_data.get('tags', []),
        )
        product = super().create(validated_data)
        self._sync_default_variant(product)
        return product

    def update(self, instance, validated_data):
        if 'emoji_db' in validated_data:
            validated_data['emoji_db'] = (validated_data.get('emoji_db') or '').strip()

        next_name = validated_data.get('name', instance.name)
        next_category = validated_data.get('category', instance.category)
        next_description = validated_data.get('description', instance.description)
        next_tags = validated_data.get('tags', instance.tags)
        validated_data['emoji_db'] = self._resolve_emoji_value(
            next_name,
            next_category,
            validated_data.get('emoji_db', instance.emoji_db),
            next_description,
            next_tags,
        )

        product = super().update(instance, validated_data)
        self._sync_default_variant(product)
        return product


class ProductListSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    stock = serializers.IntegerField(read_only=True)
    effective_price = serializers.SerializerMethodField()
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    emoji = serializers.CharField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    category = CategorySerializer(read_only=True)
    default_variant = serializers.SerializerMethodField()
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'price',
            'effective_price',
            'emoji',
            'category',
            'rating',
            'reviews_count',
            'stock',
            'discount_percent',
            'default_variant',
            'variants',
            'is_featured',
            'is_new_arrival',
        ]

    def get_effective_price(self, obj):
        return obj.effective_price

    def get_default_variant(self, obj):
        variant = obj.default_variant
        if not variant:
            return None
        return {
            'id': variant.id,
            'variant_name': variant.variant_name,
            'price': str(variant.price) if variant.price is not None else None,
            'stock_quantity': variant.stock_quantity,
            'low_stock_threshold': variant.low_stock_threshold,
            'weight': variant.weight,
            'unit_type': variant.unit_type,
            'unit_value': str(variant.unit_value) if variant.unit_value is not None else None,
            'is_default': variant.is_default,
        }

    def get_variants(self, obj):
        variants = obj.variants.filter(is_deleted=False).order_by('-is_default', 'id')
        return [
            {
                'id': variant.id,
                'variant_name': variant.variant_name,
                'price': str(variant.price) if variant.price is not None else None,
                'stock_quantity': variant.stock_quantity,
                'low_stock_threshold': variant.low_stock_threshold,
                'weight': variant.weight,
                'unit_type': variant.unit_type,
                'unit_value': str(variant.unit_value) if variant.unit_value is not None else None,
                'is_default': variant.is_default,
            }
            for variant in variants
        ]
