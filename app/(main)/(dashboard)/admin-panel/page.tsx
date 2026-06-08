"use client";

import { useState, useEffect } from "react";
import styles from "./adminPanel.module.css"
import toastStyles from "./toast.module.css"
import AdminCombobox from "./AdminCombobox";
import { fetchWithAuth } from "../../../../lib/api";

type UserProfile = {
  id: number;
  email: string;
  category: string;
  createdAt: string;
};

export default function AdminPanelPage() {
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  const [adminEmail, setAdminEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastInfo({ message: msg, type });
    setTimeout(() => setToastInfo(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth("http://localhost:8080/admin/users", { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetchWithAuth("http://localhost:8080/admin/admins", { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        setAdmins(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!adminEmail) return;
    try {
      const res = await fetchWithAuth("http://localhost:8080/admin/admin-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email: adminEmail })
      });
      if (res.ok) {
        showToast("Admin added successfully!", "success");
        setAdminEmail("");
        setIsAddingAdmin(false);
        fetchAdmins();
      } else {
        showToast("Failed to add admin.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error.", "error");
    }
  };

  const handleAddUser = async () => {
    if (!userEmail) return;
    try {
      const res = await fetchWithAuth("http://localhost:8080/admin/user-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, category: "A" })
      });
      if (res.ok) {
        showToast("User added successfully!", "success");
        setUserEmail("");
        setIsAddingUser(false);
        fetchUsers();
      } else {
        showToast("Failed to add user.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Network error.", "error");
    }
  };

  const handleDeleteUser = async (id: number, type: 'admin' | 'user') => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/admin/user/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (res.ok) {
        showToast(`${type === 'admin' ? 'Admin' : 'User'} removed.`);
        if (type === 'admin') fetchAdmins();
        else fetchUsers();
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleCategoryChange = async (userId: number, newCategory: string) => {
    try {
      const res = await fetchWithAuth(`http://localhost:8080/admin/update-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ userId: userId.toString(), category: newCategory })
      });
      if (res.ok) {
        showToast("Category updated.");
        fetchUsers(); // Refresh to ensure state consistency
      }
    } catch(e) {
      console.error(e);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toISOString().split('T')[0];
  };

  return (
    <div className={styles.sectionsContainer}>
      {toastInfo && (
        <div className={toastInfo.type === 'error' ? toastStyles.errorToast : toastStyles.toast}>
            {toastInfo.message}
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTop}>
            <div className={styles.sectionIdent}>
              <div className={styles.sectionIcon}>
                <img className={styles.lightIcon} src="../../icons/admin.png" alt="Admin icon" />
                <img className={styles.darkIcon} src="../../icons/admin-darkMode.png" alt="Admin icon" />
              </div>
              <h2>Admins</h2>
            </div>
            {isAddingAdmin ? (
              <div className={styles.addInputContainer}>
                <input 
                  type="email" 
                  placeholder="Enter admin email..." 
                  className={styles.addInput}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
                <button className={styles.confirmBtn} onClick={handleAddAdmin}>
                  <img src="../../icons/tick-light.png" alt="confirm" className={styles.lightIcon} />
                  <img src="../../icons/tick-dark.png" alt="confirm" className={styles.darkIcon} />
                </button>
                <button className={styles.cancelBtn} onClick={() => setIsAddingAdmin(false)}>
                  <img src="../../icons/cancel-light.png" alt="cancel" className={styles.lightIcon} />
                  <img src="../../icons/cancel-dark.png" alt="cancel" className={styles.darkIcon} />
                </button>
              </div>
            ) : (
              <button className={styles.addBtn} onClick={() => setIsAddingAdmin(true)}>
                Add New Admin
              </button>
            )}
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Email</th>
                  <th>Create Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.email}</td>
                    <td>{formatDate(admin.createdAt)}</td>
                    <td>
                      <div className={styles.removeBtn} onClick={() => handleDeleteUser(admin.id, 'admin')}>
                        <img src="../../icons/remove.png" alt="remove img" />
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>No admins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <div className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionTop}>
            <div className={styles.sectionIdent}>
              <div className={styles.sectionIcon}>
                <img className={styles.lightIcon} src="../../icons/user.png" alt="User icon" />
                <img className={styles.darkIcon} src="../../icons/user-darkMode.png" alt="User icon" />
              </div>
              <h2>Users</h2>
            </div>
            {isAddingUser ? (
              <div className={styles.addInputContainer}>
                <input 
                  type="email" 
                  placeholder="Enter user email..." 
                  className={styles.addInput}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
                <button className={styles.confirmBtn} onClick={handleAddUser}>
                  <img src="../../icons/tick-light.png" alt="confirm" className={styles.lightIcon} />
                  <img src="../../icons/tick-dark.png" alt="confirm" className={styles.darkIcon} />
                </button>
                <button className={styles.cancelBtn} onClick={() => setIsAddingUser(false)}>
                  <img src="../../icons/cancel-light.png" alt="cancel" className={styles.lightIcon} />
                  <img src="../../icons/cancel-dark.png" alt="cancel" className={styles.darkIcon} />
                </button>
              </div>
            ) : (
              <button className={styles.addBtn} onClick={() => setIsAddingUser(true)}>
                Add New User
              </button>
            )}
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Email</th>
                  <th>Create Date</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <AdminCombobox 
                          value={user.category || "A"} 
                          onChange={(val) => handleCategoryChange(user.id, val)} 
                          options={["A", "B"]} 
                          containerClassName={styles.categoryCombobox}
                      />
                    </td>
                    <td>
                      <div className={styles.removeBtn} onClick={() => handleDeleteUser(user.id, 'user')}>
                        <img src="../../icons/remove.png" alt="remove img" />
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
