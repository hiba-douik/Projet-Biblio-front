import React, { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { Trash2, FileText, Edit2 } from 'lucide-react';

import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    titre: '',
    description: '',
    filier: '',
    niveaux: '',
    bibliothequeId: '',
    typeId: ''
  });

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}`+'/api/document/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleEdit = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/document/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditData(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${process.env.REACT_APP_API_URL}/api/document/${editData.id}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowEditModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  useEffect(() => {
    fetchDocuments(); // Fetch documents on component mount
  }, []);

  const handleDelete = (document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  // Function to confirm delete action
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/document/delete/${documentToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to request headers
          'Content-Type': 'application/json'

        },
      });

      // Remove the deleted document from the state
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id));

      // Close the modal and reset the document to delete
      setShowDeleteModal(false);
      setDocumentToDelete(null);

      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'PDF': 'danger',
      'DOCX': 'primary',
      'TXT': 'success',
      'default': 'secondary'
    };
    return colors[type] || colors.default;
  };

  const filteredDocuments = documents.filter(doc =>
    // eslint-disable-next-line no-undef
    doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // eslint-disable-next-line no-undef
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>     
     
        <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8f9fa' }}>
          {/* Header Section */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h2 className="fw-bold text-primary mb-0">
                <FileText className="me-2 d-inline-block" size={28} />
                Gestion des Documents
              </h2>
              <p className="text-muted mt-1">Gérez vos documents académiques</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 px-4 py-3">Titre</th>
                      <th className="border-0 px-4">Description</th>
                      <th className="border-0 px-4">Type</th>
                      <th className="border-0 px-4">Filière</th>
                      <th className="border-0 px-4">Niveau</th>
                      <th className="border-0 px-4">
                        <FontAwesomeIcon icon={faThumbsUp} size="lg" className="text-success" /> Like
                      </th>
                      <th className="border-0 px-4">
                        <FontAwesomeIcon icon={faThumbsDown} size="lg" className="text-danger" /> Dislike
                      </th>
                      <th className="border-0 px-4">Date</th>
                      <th className="border-0 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document) => (
                      <tr key={document.id}>
                        <td className="px-4 py-3">
                          <div className="fw-semibold text-dark">{document.titre}</div>
                        </td>
                        <td className="px-4">
                          <div className="text-muted">{document.description}</div>
                        </td>
                        <td className="px-4">
                          <span className={`badge bg-${getTypeColor(document.type?.typeName)} bg-opacity-75`}>
                            {document.type?.typeName}
                          </span>
                        </td>
                        <td className="px-4">{document.filier}</td>
                        <td className="px-4">
                          <span className="badge bg-info bg-opacity-75">{document.niveaux}</span>
                        </td>
                        <td className="px-4">
                          <span className="badge bg-info bg-opacity-75">{document.likes}</span>
                        </td>
                        <td className="px-4">
                          <span className="badge bg-info bg-opacity-75">{document.dislike}</span>
                        </td>
                        <td className="px-4">
                          <small className="text-muted">
                            {new Date(document.date).toLocaleDateString()}
                          </small>
                        </td>
                        <td className="px-4 text-center">
                          <button
                            onClick={() => handleDelete(document)}
                            className="btn btn-link text-danger p-2"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            // eslint-disable-next-line no-undef
                            onClick={() => handleUpdate(document)}
                            className="btn btn-link text-danger p-2"
                            title="Supprimer"
                          >
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredDocuments.length === 0 && (
                <div className="text-center py-5">
                  <FileText size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">Aucun document trouvé</h5>
                  <p className="text-muted mb-0">Ajoutez des documents ou modifiez vos critères de recherche</p>
                </div>
              )}
            </div>
          </div>

          {/* Delete Modal */}
          {showDeleteModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                  <div className="modal-header border-0">
                    <h5 className="modal-title">Confirmer la suppression</h5>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowDeleteModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="text-center mb-4">
                      <div className="rounded-circle bg-danger bg-opacity-10 p-3 d-inline-block mb-3">
                        <Trash2 size={32} className="text-danger" />
                      </div>
                      <h5>Êtes-vous sûr ?</h5>
                      <p className="text-muted mb-0">
                        Vous êtes sur le point de supprimer "{documentToDelete?.titre}". 
                        Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button 
                      type="button" 
                      className="btn btn-light px-4"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Annuler
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger px-4" 
                      onClick={confirmDelete}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {showEditModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Modifier le Document</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Titre</label>
                      <input
                        type="text"
                        className="form-control"
                        name="titre"
                        value={editData.titre}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Filière</label>
                      <input
                        type="text"
                        className="form-control"
                        name="filier"
                        value={editData.filier}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Niveau</label>
                      <input
                        type="text"
                        className="form-control"
                        name="niveaux"
                        value={editData.niveaux}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Bibliothèque ID</label>
                      <input
                        type="number"
                        className="form-control"
                        name="bibliothequeId"
                        value={editData.bibliothequeId}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Type ID</label>
                      <input
                        type="number"
                        className="form-control"
                        name="typeId"
                        value={editData.typeId}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </> 
  );
};

export default DocumentList;
