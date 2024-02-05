import React, { useState, useEffect } from 'react';
import './Dataform.css';
import Loader from '../LoaderComponent/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DataForm({ submitButtonEmit, clickedScatterPointData }) {
  const [formData, setFormData] = useState(clickedScatterPointData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addButtonDisable, setAddButtonDisable] = useState(false);
  useEffect(() => {
    setErrors({});
    setFormData(clickedScatterPointData || { id: '', x: '', y: '', label: '' });
    if (clickedScatterPointData.id) {
      setAddButtonDisable(true);
    }
  }, [clickedScatterPointData]);

  const getDBid = (currentId) => {
    const idMapString = localStorage.getItem('idMap');
    const idMap = JSON.parse(idMapString || '{}');
    return idMap[currentId];
  };
  const validateForm = (update = false) => {
    let isValid = true;
    let errors = {};
    if (
      !update &&
      (!formData.id ||
        isNaN(formData.id) ||
        formData.id <= 0 ||
        !Number.isInteger(Number(formData.id)) ||
        getDBid(formData.id))
    ) {
      if (getDBid(formData.id)) {
        errors.id = 'id must be unique, Please enter some other number';
      } else {
        errors.id = 'id must be a positive integer';
      }
      isValid = false;
    }
    if (!formData.x || formData.x < -100 || formData.x > 100) {
      errors.x = 'x must be between -100 and 100';
      isValid = false;
    }
    if (!formData.y || formData.y < -100 || formData.y > 100) {
      errors.y = 'y must be between -100 and 100';
      isValid = false;
    }
    if (
      !formData.label ||
      formData.label.length < 5 ||
      formData.label.length > 10
    ) {
      errors.label = 'label must be 5-10 characters long';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };
  const handleBack = () => {
    setFormData({ id: '', x: '', y: '', label: '' });
    setErrors({});
    setAddButtonDisable(false);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const { id: pointId, x: xCoord, y: yCoord, label } = formData;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/activity/insertPoint`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pointId, xCoord, yCoord, label }),
        }
      );
      const responseData = await response.json();
      setLoading(false);
      setFormData({ id: '', x: '', y: '', label: '' });
      if (response.ok) {
        toast.success(responseData.message || 'Point successfully added!');
        submitButtonEmit(Date.now());
      } else {
        toast.error(responseData.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Something went wrong');
      setLoading(false);
      setFormData({ id: '', x: '', y: '', label: '' });
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) {
      return;
    }
    setLoading(true);
    const { id: pointId, x: xCoord, y: yCoord, label } = formData;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/activity/updatePoint`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: getDBid(pointId), xCoord, yCoord, label }),
        }
      );
      const responseData = await response.json();
      setLoading(false);
      setFormData({ id: '', x: '', y: '', label: '' });
      if (response.ok) {
        toast.success(responseData.message || 'Point successfully updated!');
        submitButtonEmit(Date.now());
      } else {
        toast.error(responseData.message || 'Update unsucessful!');
      }
    } catch (err) {
      toast.error('Something went wrong');
      setLoading(false);
      setFormData({ id: '', x: '', y: '', label: '' });
    }

    handleBack();
  };
  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { id: pointId } = formData;
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_BACKEND_BASE_URL
        }/activity/deletePoint?id=${getDBid(pointId)}`,
        {
          method: 'DELETE',
        }
      );
      const responseData = await response.json();
      setLoading(false);
      setFormData({ id: '', x: '', y: '', label: '' });
      if (response.ok) {
        toast.success(responseData.message || 'Point successfully deleted!');
        submitButtonEmit(Date.now());
      } else {
        toast.error(responseData.message || 'Delete unsucessful!');
      }
    } catch (err) {
      toast.error('Something went wrong');
      setLoading(false);
      setFormData({ id: '', x: '', y: '', label: '' });
    }
    handleBack();
  };
  const renderButtons = () => {
    if (addButtonDisable) {
      return (
        <>
          <button type="button" className="form-update" onClick={handleUpdate}>
            Update
          </button>
          <button type="button" className="form-delete" onClick={handleDelete}>
            Delete
          </button>
        </>
      );
    } else {
      return <input type="submit" value="Submit" className="form-submit" />;
    }
  };
  if (loading) {
    return (
      <div>
        <ToastContainer />
        <Loader />;
      </div>
    );
  }
  return (
    <div>
      <ToastContainer />
      {addButtonDisable && (
        <button onClick={handleBack} className="form-back-button">
          &#8592; add
        </button>
      )}
      <form onSubmit={handleSubmit} className="data-form">
        <div className="form-group">
          <label className="form-label">id</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="form-input"
            disabled={!!addButtonDisable}
          />
          {errors.id && <div className="error-message">{errors.id}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">x-coordinate</label>
          <input
            type="number"
            name="x"
            value={formData.x}
            onChange={handleChange}
            className="form-input"
          />
          {errors.x && <div className="error-message">{errors.x}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">y-coordinate</label>
          <input
            type="number"
            name="y"
            value={formData.y}
            onChange={handleChange}
            className="form-input"
          />
          {errors.y && <div className="error-message">{errors.y}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">label</label>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleChange}
            className="form-input"
          />
          {errors.label && <div className="error-message">{errors.label}</div>}
        </div>
        {renderButtons()}
      </form>
    </div>
  );
}

export default DataForm;
