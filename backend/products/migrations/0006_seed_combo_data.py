# Seed initial combo data

from django.db import migrations


def create_sample_combos(apps, schema_editor):
    """Create sample product combos."""
    Combo = apps.get_model('products', 'Combo')
    Product = apps.get_model('products', 'Product')
    
    # Get some products to create combos
    products = list(Product.objects.filter(is_active=True, is_deleted=False).order_by('id'))
    
    if len(products) < 4:
        return  # Not enough products to create combos
    
    # Create sample combos
    combos_data = [
        {
            'name': 'Breakfast Essentials',
            'description': 'Start your day right with this perfect breakfast combo!',
            'discount_percent': 15,
            'product_indices': [0, 1],  # First two products
        },
        {
            'name': 'Healthy Snacking Pack',
            'description': 'A selection of healthy snacks for guilt-free munching.',
            'discount_percent': 12,
            'product_indices': [2, 3, 4] if len(products) > 4 else [2, 3],  # 3 products if available
        },
        {
            'name': 'Weekly Essentials Bundle',
            'description': 'Everything you need for your weekly grocery run!',
            'discount_percent': 18,
            'product_indices': [0, 2] if len(products) > 2 else [0, 1],
        },
        {
            'name': 'Family Favorites',
            'description': 'Family-approved products at a special combo price.',
            'discount_percent': 10,
            'product_indices': [1, 3] if len(products) > 3 else [0, 1],
        },
    ]
    
    for combo_data in combos_data:
        product_indices = combo_data.pop('product_indices')
        # Filter valid indices
        valid_indices = [i for i in product_indices if i < len(products)]
        
        if len(valid_indices) >= 2:  # Need at least 2 products for a combo
            combo = Combo.objects.create(**combo_data)
            combo.products.set([products[i] for i in valid_indices])
            combo.save()


def reverse_combos(apps, schema_editor):
    """Remove all combos."""
    Combo = apps.get_model('products', 'Combo')
    Combo.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0005_combo'),
    ]

    operations = [
        migrations.RunPython(create_sample_combos, reverse_combos),
    ]
