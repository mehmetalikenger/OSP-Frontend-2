"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "./adminPanel.module.css"
import toastStyles from "./toast.module.css"
import AdminCombobox from "./AdminCombobox";
import { fetchWithAuth } from "../../../../lib/api";

type UserProfile = {
  id: number;
  email: string;
  category: string;
  createdAt: string;
  status?: "ACTIVE" | "PENDING" | "DELETED";
};

export default function AdminPanelPage() {
  const t = useTranslations("AdminDashboard");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  
  const [adminEmail, setAdminEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: number, type: 'admin' | 'user', email: string} | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastInfo({ message: msg, type });
    setTimeout(() => setToastInfo(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins`, { credentials: 'include', cache: 'no-store' });
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/admin-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email: adminEmail })
      });
      if (res.ok) {
        showToast(t("adminAdded"), "success");
        setAdminEmail("");
        setIsAddingAdmin(false);
        fetchAdmins();
        fetchUsers();
      } else {
        try {
            const errorData = await res.json();
            if (errorData.message) {
                showToast(errorData.message, "error");
            } else if (errorData.error) {
                showToast(errorData.error, "error");
            } else {
                showToast(t("failedAddAdmin"), "error");
            }
        } catch {
            showToast("Failed to add admin.", "error");
        }
      }
    } catch (error) {
      console.error(error);
      showToast(t("networkError"), "error");
    }
  };

  const handleAddUser = async () => {
    if (!userEmail) return;
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/user-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, category: "A" })
      });
      if (res.ok) {
        showToast(t("userAdded"), "success");
        setUserEmail("");
        setIsAddingUser(false);
        fetchUsers();
        fetchAdmins();
      } else {
        try {
            const errorData = await res.json();
            if (errorData.message) {
                showToast(errorData.message, "error");
            } else if (errorData.error) {
                showToast(errorData.error, "error");
            } else {
                showToast(t("failedAddUser"), "error");
            }
        } catch {
            showToast("Failed to add user.", "error");
        }
      }
    } catch (error) {
      console.error(error);
      showToast(t("networkError"), "error");
    }
  };

  const openDeleteModal = (id: number, type: 'admin' | 'user', email: string) => {
    setUserToDelete({ id, type, email });
    setDeleteConfirmationText("");
    setDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/user/${userToDelete.id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (res.ok) {
        showToast(userToDelete.type === 'admin' ? t("adminRemoved") : t("userRemoved"));
        if (userToDelete.type === 'admin') fetchAdmins();
        else fetchUsers();
      } else {
        showToast(t("failedRemove"), "error");
      }
    } catch(e) {
      console.error(e);
      showToast(t("networkError"), "error");
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCategoryChange = async (userId: number, newCategory: string) => {
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ userId: userId.toString(), category: newCategory })
      });
      if (res.ok) {
        showToast(t("categoryUpdated"));
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
              <h2>{t("admins")}</h2>
            </div>
            {isAddingAdmin ? (
              <div className={styles.addInputContainer}>
                <input
                  type="email"
                  placeholder={t("enterAdminEmail")}
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
                {t("addNewAdmin")}
              </button>
            )}
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("colNo")}</th>
                  <th>{t("colEmail")}</th>
                  <th>{t("colCreateDate")}</th>
                  <th>{t("colAction")}</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.email}</td>
                    <td>{formatDate(admin.createdAt)}</td>
                    <td>
                      <div className={styles.removeBtn} onClick={() => openDeleteModal(admin.id, 'admin', admin.email)}>
                        <img src="../../icons/remove.png" alt="remove img" />
                      </div>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>{t("noAdmins")}</td>
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
              <h2>{t("users")}</h2>
            </div>
            {isAddingUser ? (
              <div className={styles.addInputContainer}>
                <input
                  type="email"
                  placeholder={t("enterUserEmail")}
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
                {t("addNewUser")}
              </button>
            )}
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("colNo")}</th>
                  <th>{t("colEmail")}</th>
                  <th>{t("colCreateDate")}</th>
                  <th>{t("colCategory")}</th>
                  <th>{t("colAction")}</th>
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
                      <div className={styles.removeBtn} onClick={() => openDeleteModal(user.id, 'user', user.email)}>
                        <img src="../../icons/remove.png" alt="remove img" />
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>{t("noUsers")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      {deleteModalOpen && userToDelete && (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{t("confirmDeletionTitle")}</h3>
                <p>{t("confirmDeleteBody", { type: userToDelete.type === 'admin' ? t("typeAdmin") : t("typeUser") })}</p>
                <p>{t.rich("confirmDeleteEmail", { email: userToDelete.email, strong: (chunks) => <strong>{chunks}</strong> })}</p>
                <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={t("enterEmailToConfirm")}
                />
                <div className={styles.modalButtons}>
                    <button 
                        className={styles.cancelModalBtn} 
                        onClick={() => setDeleteModalOpen(false)}
                    >
                        {t("cancel")}
                    </button>
                    <button
                        className={styles.confirmModalBtn}
                        disabled={deleteConfirmationText !== userToDelete.email}
                        onClick={confirmDeleteUser}
                    >
                        {t("delete")}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
