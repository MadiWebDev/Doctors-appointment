import React, { useEffect, useState } from 'react';
import { Plus, X, Edit } from 'lucide-react';
import { SPECIALIZATIONS } from '../../utils/helpers';
import Spinner from '../../Components/shared/Spinner';
import Modal from '../../Components/shared/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Specializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    setSpecializations(SPECIALIZATIONS);
    setLoading(false);
  }, []);

  const handleAdd = () => {
    if (!newSpecialization.trim()) {
      toast.error('Please enter a specialization');
      return;
    }
    if (specializations.includes(newSpecialization)) {
      toast.error('Specialization already exists');
      return;
    }
    setSpecializations([...specializations, newSpecialization]);
    setNewSpecialization('');
    setShowAddModal(false);
    toast.success('Specialization added');
  };

  const handleDelete = (spec) => {
    setSpecializations(specializations.filter((s) => s !== spec));
    toast.success('Specialization removed');
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Specializations</h1>
            <p className="page-subtitle">Manage available medical specializations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Specialization
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specializations.map((spec) => (
            <div
              key={spec}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="font-medium text-slate-900">{spec}</span>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(spec)}
                  className="p-2 text-slate-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewSpecialization('');
        }}
        title="Add Specialization"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Specialization Name</label>
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              className="input"
              placeholder="e.g., Neurology"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewSpecialization('');
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleAdd} className="btn btn-primary flex-1">
              Add
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Specializations;
