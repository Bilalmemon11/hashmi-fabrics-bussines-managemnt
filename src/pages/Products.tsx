import React, { useState } from "react";
import { Topbar } from "../components/Topbar";
import { Modal } from "../components/Modal";
import { useApp } from "../context/AppContext";
import { formatPKR } from "../utils";
import { Plus, Edit2, Trash2, Tag, ShieldAlert, BadgePercent } from "lucide-react";
import { Product } from "../types";

export const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(0);
  const [unit, setUnit] = useState("pcs");
  const [reorderLevel, setReorderLevel] = useState<number>(5);

  const handleOpenAddModal = () => {
    setName("");
    setCategory("");
    setPrice(0);
    setCostPrice(0);
    setStockQty(0);
    setUnit("pcs");
    setReorderLevel(5);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const success = await addProduct({
      name,
      category: category || "Uncategorized",
      price: Number(price) || 0,
      cost_price: Number(costPrice) || 0,
      stock_qty: Number(stockQty) || 0,
      unit,
      reorder_level: Number(reorderLevel) || 5,
    });

    if (success) {
      setIsAddModalOpen(false);
    }
  };

  const handleOpenEditModal = (prod: Product) => {
    setSelectedProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setPrice(prod.price);
    setCostPrice(prod.cost_price);
    setStockQty(prod.stock_qty);
    setUnit(prod.unit);
    setReorderLevel(prod.reorder_level);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !name.trim()) return;

    const success = await updateProduct(selectedProduct.id, {
      name,
      category: category || "Uncategorized",
      price: Number(price) || 0,
      cost_price: Number(costPrice) || 0,
      stock_qty: Number(stockQty) || 0,
      unit,
      reorder_level: Number(reorderLevel) || 5,
    });

    if (success) {
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0f1117] text-[#e8eaf0] min-h-screen">
      <Topbar
        title="Products Catalog"
        action={
          <button
            onClick={handleOpenAddModal}
            className="bg-[#6c63ff] hover:bg-[#7c75ff] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-150 cursor-pointer"
          >
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto">
        <div className="bg-[#1c2233] border border-[#2a3248] rounded-xl p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#8892a4]">
              Fabric Rolls & Suit Catalog
            </h3>
            <span className="text-xs text-[#8892a4]">
              Total Catalog Items: <span className="font-bold text-white">{products.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            {products.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center text-[#8892a4]/70">
                <Tag size={48} className="mb-2 text-[#8892a4]/20 animate-pulse" />
                <span className="text-sm font-medium">No products in catalog yet</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-[#e8eaf0]">
                <thead>
                  <tr className="text-[#8892a4] border-b border-[#2a3248]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Fabric Product</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Sale Price (PKR)</th>
                    <th className="py-3 px-4 font-semibold">Cost Price (PKR)</th>
                    <th className="py-3 px-4 font-semibold">Margin %</th>
                    <th className="py-3 px-4 font-semibold">Current Stock</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3248]/40">
                  {products.map((p) => {
                    // Margin calculation
                    const margin = p.price - p.cost_price;
                    const marginPct = p.price > 0 ? (margin / p.price) * 100 : 0;
                    const isLowStock = p.stock_qty <= p.reorder_level;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#161b27]/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-white">
                          {p.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-[#161b27] px-2.5 py-1 border border-[#2a3248] text-xs text-[#8892a4] rounded-lg">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#a78bfa]">
                          {formatPKR(p.price)}
                        </td>
                        <td className="py-3 px-4 text-[#8892a4]">
                          {formatPKR(p.cost_price)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[#22c55e] font-bold flex items-center gap-0.5">
                            <BadgePercent size={12} /> {marginPct.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${
                              isLowStock
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-green-500/10 text-green-400 border-green-500/20"
                            }`}
                          >
                            {p.stock_qty} {p.unit}
                            {isLowStock && " (LOW)"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="text-[#a78bfa] border border-[#6c63ff]/10 hover:bg-[#6c63ff]/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Edit product parameters"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-red-400 border border-red-500/10 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Delete catalog entry"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Add Product */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Fabric Product to Catalog"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Fabric Name *
            </label>
            <input
              type="text"
              required
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              placeholder="E.g., Lawn Fabric 3m"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Category
              </label>
              <input
                type="text"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="E.g., Lawn, Silk, Cotton"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Unit of Measure
              </label>
              <select
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="pcs">Pcs</option>
                <option value="meters">Meters</option>
                <option value="kg">Kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Sale Price (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="E.g., 850"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Purchase Cost (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="E.g., 550"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Opening Stock Level
              </label>
              <input
                type="number"
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="Opening units"
                value={stockQty}
                onChange={(e) => setStockQty(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Reorder Trigger Level
              </label>
              <input
                type="number"
                min="1"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                placeholder="Trigger alert point"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#2a3248]/50">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 border border-[#2a3248] text-[#e8eaf0] hover:bg-[#161b27] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-[#6c63ff] hover:bg-[#7c75ff] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Product */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Fabric Product Catalog"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
              Fabric Name *
            </label>
            <input
              type="text"
              required
              className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Category
              </label>
              <input
                type="text"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Unit of Measure
              </label>
              <select
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="pcs">Pcs</option>
                <option value="meters">Meters</option>
                <option value="kg">Kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Sale Price (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Purchase Cost (PKR) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={stockQty}
                onChange={(e) => setStockQty(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#8892a4] uppercase mb-1">
                Reorder Trigger Level
              </label>
              <input
                type="number"
                min="1"
                className="bg-[#0f1117] border border-[#2a3248] text-[#e8eaf0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6c63ff] w-full"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-[#2a3248]/50">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
              }}
              className="flex-1 border border-[#2a3248] text-[#e8eaf0] hover:bg-[#161b27] px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-[#6c63ff] hover:bg-[#7c75ff] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              Update Details
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
