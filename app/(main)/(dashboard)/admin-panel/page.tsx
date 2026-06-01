"use client";

import { useState } from "react";
import styles from "./adminPanel.module.css"

export default function AdminPanelPage() {
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  return (
    <div className={styles.sectionsContainer}>
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
                <input type="email" placeholder="Enter admin email..." className={styles.addInput} />
                <button className={styles.confirmBtn} onClick={() => setIsAddingAdmin(false)}>
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
                <tr>
                  <td>1</td>
                  <td>admin1@offitec.com</td>
                  <td>2024-05-12</td>
                  <td>
                    <div className={styles.removeBtn}>
                      <img src="../../icons/remove.png" alt="remove img" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>admin2@offitec.com</td>
                  <td>2024-05-14</td>
                  <td>
                    <div className={styles.removeBtn}>
                      <img src="../../icons/remove.png" alt="remove img" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>admin3@offitec.com</td>
                  <td>2024-05-20</td>
                  <td>
                    <div className={styles.removeBtn}>
                      <img src="../../icons/remove.png" alt="remove img" />
                    </div>
                  </td>
                </tr>
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
                <input type="email" placeholder="Enter user email..." className={styles.addInput} />
                <button className={styles.confirmBtn} onClick={() => setIsAddingUser(false)}>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>user1@mail.com</td>
                  <td>2024-05-12</td>
                  <td>
                    <div className={styles.removeBtn}>
                      <img src="../../icons/remove.png" alt="remove img" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>user2@mail.com</td>
                  <td>2024-05-14</td>
                  <td>
                    <div className={styles.removeBtn}>
                      <img src="../../icons/remove.png" alt="remove img" />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>user3@mail.com</td>
                  <td>2024-05-20</td>
                  <td>
                    <div className={styles.removeBtn}>
                      <img src="../../icons/remove.png" alt="remove img" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
