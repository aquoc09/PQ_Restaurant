import React from 'react';

const getChildCategories = (parent, allCategories) => {
    if (!parent.subCategories || parent.subCategories.length === 0) return [];
    // Lọc những thằng nào trong toàn bộ list có categoryCode nằm trong list subCategories của cha
    return allCategories.filter(cat => parent.subCategories.includes(cat.categoryCode));
};

const CategoryFilter = ({ allCategories, selectedCategoryId, onCategoryChange, loading }) => {
    
    const rootCategories = allCategories.filter(cat => cat.parentCategory === null);
    
    if (loading) {
        return <div className="text-gray-500">Đang tải danh mục...</div>;
    }

    return (
        <div className="w-full">
            <h4 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Category</h4>
            <div className="flex flex-col gap-1 relative">
                <button
                    onClick={() => onCategoryChange(0)}
                    className={`text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium
                    ${selectedCategoryId === 0 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                >
                    Tất cả sản phẩm
                </button>
                {/* DANH SÁCH CHA */}
                {rootCategories.map((parent) => {
                    // Tìm con của thằng cha này
                    const children = getChildCategories(parent, allCategories);
                    const hasChildren = children.length > 0;
                    const isChildSelected = children.some(child => child.id === selectedCategoryId);

                    return (
                        <div key={parent.id} className="group relative">
                            {hasChildren ? (
                                // TRƯỜNG HỢP CÓ CON -> Dùng thẻ DIV (Không bấm được), chỉ Hover
                                <div className={`w-full flex justify-between items-center text-left py-2.5 px-4 rounded-lg font-bold cursor-default
                                    ${isChildSelected ? 'text-red-600 bg-red-50' : 'text-gray-800 hover:bg-gray-100'}`}
                                >
                                    <span>{parent.name}</span>
                                    {/* Mũi tên xoay khi hover */}
                                    <span className="text-xs opacity-60 transition-transform duration-200 group-hover:rotate-90">▶</span>
                                </div>
                            ) : (
                                // TRƯỜNG HỢP KHÔNG CÓ CON (VD: SALAD) -> Dùng BUTTON (Phải bấm được)
                                <button
                                    onClick={() => onCategoryChange(parent.id)}
                                    className={`w-full text-left py-2.5 px-4 rounded-lg transition-all duration-200 font-medium
                                        ${selectedCategoryId === parent.id 
                                            ? 'bg-red-500 text-white shadow-md' 
                                            : 'text-gray-600 hover:bg-red-50 hover:text-red-500'}`
                                    }
                                >
                                    {parent.name}
                                </button>
                            )}

                            {/* --- MENU CON (DROPDOWN) --- */}
                            {hasChildren && (
                                <div className="hidden group-hover:block absolute top-full left-0 mt-0 w-full bg-white shadow-xl rounded-lg border border-gray-100 z-50 overflow-hidden">
                                    <div className="py-2">
                                        {children.map(child => (
                                            <button
                                                key={child.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCategoryChange(child.id);
                                                }}
                                                className={`block w-full text-left px-4 py-2 text-sm transition-colors
                                                    ${selectedCategoryId === child.id 
                                                        ? 'bg-red-50 text-red-600 font-bold' 
                                                        : 'text-gray-600 hover:bg-tertiary hover:text-red-600'}`
                                                }
                                            >
                                                {child.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CategoryFilter;