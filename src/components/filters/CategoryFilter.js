import React from 'react';

const CategoryFilter = ({ categories, selectedCategoryId, onCategoryChange, loading }) => {
    
    // Thêm Category "Tất cả" vào đầu danh sách
    const allCategories = [{ id: 0, name: 'Tất cả sản phẩm', categoryCode: 'ALL' }, ...categories];
    
    if (loading) {
        return <div className="text-gray-500">Đang tải danh mục...</div>;
    }

    return (
        <div className="mb-4">
            <h4 className="font-semibold mb-3 text-gray-700">Category</h4>
            <div className="flex flex-col space-y-2">
                {allCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={`text-left py-1 px-3 rounded-lg transition duration-150 
                            ${selectedCategoryId === category.id 
                                ? 'bg-red-500 text-white font-bold' 
                                : 'text-gray-700 hover:bg-red-50'}`
                        }
                    >
                        {category.name}
                        {category.subCategories && category.subCategories.length > 0 && (
                        <span className="text-gray-400 ml-2">({category.subCategories.length})</span>
                        )}
                    </button>
                ))}
                {categories.map((category) => (
                <div key={category.id}>
                    {category.name}
                    {category.parentCategory && (
                        <span className="text-xs text-blue-500"> (Thuộc: {category.parentCategory})</span>
                    )}
                </div>
            ))}
            </div>
        </div>
    );
}

export default CategoryFilter;