import { useEffect, useState } from 'react';
import {
  Edit2,
  Plus,
  Eye,
  ImageOff,
  Filter,
  Search,
} from 'lucide-react';
import { Product } from '../../../types/product';
import ProductFormModal from './form/ProductsForm';
import ProductViewModal from './details/ProductsDetails';
import Alert from '../../../pages/UiElements/Alerts';
import Pagination from '../../../pages/UiElements/Pagination';
import TableLoaderRow from '../../../pages/UiElements/TableLoaderRow';
import { productService } from '../../../services/products-api';
import {
  fetchProducts,
  resetProductsNewCount,
} from '../../../store/modules/products/products.slice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

const Products = () => {
  const dispatch = useAppDispatch();
  const { items: products, pagination, status } = useAppSelector(
    (state) => state.products,
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('Active');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(['All']);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const statuses = ['Active', 'Inactive'];

  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    dispatch(resetProductsNewCount());
  }, [dispatch]);

  useEffect(() => {
    const isActive = selectedStatus === 'Active';
    dispatch(fetchProducts({ page: currentPage, limit: 10, isActive }));
  }, [currentPage, dispatch, selectedStatus]);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const response = await productService.adminGetAll(1, 1000);
        const catalog = response.products ?? [];
        const uniqueCategories = Array.from(
          new Set(
            catalog
              .map((product) => product.category?.trim())
              .filter((category): category is string => Boolean(category)),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setAllProducts(catalog);
        setAllCategories(['All', ...uniqueCategories]);
      } catch (err) {
        console.error("Failed to load filters", err);
      }
    };
    loadFilterData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handleFormRefresh = () => {
    const isActive = selectedStatus === 'Active';
    dispatch(fetchProducts({ page: currentPage, limit: 10, isActive }));
    const action = selectedProduct ? 'updated' : 'added';
    showNotification('success', `Product ${action} successfully!`);
  };

  const handleOpenProductView = async (productId: string) => {
    setModalLoading(true);
    const product = allProducts.find((p) => p._id === productId);
    if (!product) {
      showNotification('error', 'Product not found.');
      setModalLoading(false);
      return;
    }
    setSelectedProduct(product);
    setIsViewOpen(true);
    setModalLoading(false);
  };

  const handleOpenProductEdit = async (productId: string) => {
    setModalLoading(true);
    const product = allProducts.find((p) => p._id === productId);
    if (!product) {
      showNotification('error', 'Product not found.');
      setModalLoading(false);
      return;
    }
    setSelectedProduct(product);
    setIsFormOpen(true);
    setModalLoading(false);
  };

  const loading = status === 'loading' || modalLoading;
  const hasClientFilters = searchTerm.trim().length > 0 || selectedCategory !== 'All';
  const sourceProducts = hasClientFilters ? allProducts : products;

  const filteredProducts = sourceProducts.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Active' ? p.isActive : !p.isActive;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const effectiveTotalItems = hasClientFilters ? filteredProducts.length : (pagination.total || 0);
  const effectiveTotalPages = hasClientFilters ? Math.ceil(effectiveTotalItems / 10) : (pagination.totalPages || 1);
  const visibleProducts = hasClientFilters ? filteredProducts.slice((currentPage - 1) * 10, currentPage * 10) : filteredProducts;

  const controlBaseClass = "h-[48px] w-full bg-gray-50/60 border-none rounded-2xl text-[12px] outline-none shadow-sm text-[#3E2723] transition-all focus:ring-2 focus:ring-[#3E2723]/5 appearance-none cursor-pointer";

  return (
        <div className="relative min-h-screen font-sans">
      {notification.show && (
        <div className="fixed top-6 right-6 z-[10000] w-full max-w-md animate-in slide-in-from-right duration-300">
          <Alert
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification({ ...notification, show: false })}
          />
        </div>
      )}
      <div className="mx-auto w-full max-w-8xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-3 shadow-sm sm:p-4 md:p-8">
        
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex w-full min-w-0 justify-between border-b border-gray-50 pb-3">
            <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-[#3E2723] tracking-tight">
                Inventory Management
                </h1>
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
            
            <div className="flex w-full min-w-0 flex-col items-stretch gap-3 md:flex-row md:items-center lg:w-auto">
              <div className="relative w-full min-w-0 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className={`${controlBaseClass} pl-11 pr-4 bg-gray-50/80`}
                />
              </div>

              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:items-center">
                <div className="relative min-w-0 md:w-40">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`${controlBaseClass} pl-10 pr-8`}
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="relative min-w-0 md:w-36">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`${controlBaseClass} pl-10 pr-8`}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
              className="flex h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#3E2723] px-8 text-[11px] tracking-widest text-white shadow-md transition-all active:scale-95 hover:bg-[#2D1B19] sm:w-auto"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="table-scroll-wrapper -mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4">
          <table className="w-full text-left border-separate border-spacing-y-2 min-w-[700px]">
            <thead>
              <tr className="text-[#3E2723] opacity-40 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-6 py-2 w-16 text-center">Id</th>
                <th className="px-6 py-2 text-center w-24">Images</th>
                <th className="px-6 py-2">Name</th>
                <th className="px-6 py-2 hidden lg:table-cell">Category</th>
                <th className="px-6 py-2">Status</th>
                <th className="px-6 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableLoaderRow colSpan={6} />
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 text-xs tracking-wider">
                    No products found
                  </td>
                </tr>
              ) : (
                visibleProducts.map((item, i) => {
                  const firstImg = item.images?.[0];
                  const displayImage = typeof firstImg === 'object' && firstImg !== null ? (firstImg as any).url : firstImg;
                  return (
                    <tr key={item._id || i}>
                      <td className="px-6 py-3 bg-gray-50/40 rounded-l-2xl text-[#3E2723] font-black text-xs text-center">
                        {String((currentPage - 1) * 10 + i + 1).padStart(2, '0')}
                      </td>
                      <td className="px-6 py-3 bg-gray-50/40">
                        <div className="w-10 h-10 mx-auto rounded-xl border border-white shadow-sm overflow-hidden bg-white p-0.5 flex items-center justify-center">
                          {displayImage ? (
                            <img src={displayImage} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <ImageOff size={14} className="text-gray-200" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 bg-gray-50/40 text-[#3E2723] text-sm truncate max-w-[200px]">
                        {item.name}
                      </td>
                      <td className="px-6 py-3 bg-gray-50/40 text-[#3E2723] text-sm truncate max-w-[200px]">
                        {item.category}
                      </td>
                      <td className="px-6 py-3 bg-gray-50/40">
                        <span className={`px-2.5 py-0.5 text-[8px] font-black rounded-full border ${item.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {item.isActive ? '● ACTIVE' : '○ INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-3 bg-gray-50/40 rounded-r-2xl text-center">
                        <div className="flex justify-center gap-0.5">
                          <button onClick={() => handleOpenProductView(item._id)} className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleOpenProductEdit(item._id)} className="p-2 text-gray-400 hover:bg-white rounded-lg transition-all">
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-gray-50 pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={effectiveTotalPages}
            totalItems={effectiveTotalItems}
            itemsPerPage={10}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </div>
      </div>

      <ProductFormModal product={selectedProduct} isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onRefresh={handleFormRefresh} />
      <ProductViewModal product={selectedProduct} isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} />
    </div>
  );
};

export default Products;
