"use client";

import { useState, useEffect } from "react";
import sharedStyles from "../sharedProfile.module.css";
import styles from "./projects.module.css";

export default function ProjectsPage() {
    const [projectName, setProjectName] = useState("Test Project 1");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (isCreateModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCreateModalOpen]);

    const formatMobileProjectName = (name: string) => {
        return name.split(" ").map(word => {
            if (word.length > 10) {
                return word.slice(0, 10) + "...";
            }
            return word;
        }).join(" ");
    };

    const handleInputChange = (field: string, value: string) => {
        setIsDirty(true);
        if (field === "address") setAddress(value);
        else if (field === "country") setCountry(value);
        else if (field === "city") setCity(value);
        else if (field === "phone") setPhone(value);
    };

    const handleSave = () => {
        setToastMessage("Changes are saved");
        setIsDirty(false);
        setTimeout(() => setToastMessage(""), 3000);
    };

    return (
        <div className={sharedStyles.pageContentContainer}>
            {toastMessage && (
                <div className={styles.toast}>
                    {toastMessage}
                </div>
            )}
            <div className={sharedStyles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={sharedStyles.headerContent}>
                        <div className={sharedStyles.headerBullet}></div>
                        <h1>Projects</h1>
                    </div>
                    <button 
                        className={styles.createProjectBtn} 
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create Project
                    </button>
                </div>
                <div className={sharedStyles.headerLine}></div>
            </div>
            <div className={styles.projectsContainer}>
                {isOpen ? (
                    <div className={styles.projects}>
                        <div className={`${styles.projectOpen} ${styles.project}`}>
                            <div className={`${styles.arrow} ${styles.arrowOpen}`} onClick={() => setIsOpen(false)}>
                                <img src="/icons/back.png" alt="Arrow down icon" className={styles.lightIcon} />
                                <img src="/icons/back-darkMode.png" alt="Arrow down icon" className={styles.darkIcon} />
                            </div>
                            <div className={styles.projectHeader}>
                                <div className={styles.projectName}>
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => {
                                                setProjectName(e.target.value);
                                                setIsDirty(true);
                                            }}
                                            onBlur={() => setIsEditingName(false)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    setIsEditingName(false);
                                                }
                                            }}
                                            className={styles.projectNameInput}
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <h2 className={styles.desktopName}>{projectName}</h2>
                                            <h2 className={styles.mobileName}>{formatMobileProjectName(projectName)}</h2>
                                            <div className={styles.editIcon} onClick={() => setIsEditingName(true)}>
                                                <img src="/icons/edit.png" alt="Edit icon" className={styles.lightIcon} />
                                                <img src="/icons/edit-darkMode.png" alt="Edit icon" className={styles.darkIcon} />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className={styles.dates}>
                                    <div className={styles.date}>
                                        <span className={styles.dateTitle}>Creation Date:</span>
                                        <span className={styles.dateValue}>01/01/2024</span>
                                    </div>
                                    <div className={styles.date}>
                                        <span className={styles.dateTitle}>Update Date:</span>
                                        <span className={styles.dateValue}>01/01/2024</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.headerLine}></div>
                            <div className={styles.projectBody}>
                                <div className={styles.contactInformation}>
                                    <div className={`${styles.informationRow} ${styles.adress}`}>
                                        <label htmlFor="address">Address</label>
                                        <textarea
                                            className={styles.addressInput}
                                            id="address"
                                            value={address}
                                            onChange={(e) => handleInputChange("address", e.target.value)}
                                        />
                                    </div>
                                    <div className={`${styles.informationRow} ${styles.country}`}>
                                        <label htmlFor="country">Country</label>
                                        <input
                                            type="text"
                                            className={styles.countryValue}
                                            id="country"
                                            value={country}
                                            onChange={(e) => handleInputChange("country", e.target.value)}
                                        />
                                    </div>
                                    <div className={`${styles.informationRow} ${styles.city}`}>
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text"
                                            className={styles.cityValue}
                                            id="city"
                                            value={city}
                                            onChange={(e) => handleInputChange("city", e.target.value)}
                                        />
                                    </div>
                                    <div className={`${styles.informationRow} ${styles.phone}`}>
                                        <label htmlFor="phone">Phone</label>
                                        <input
                                            type="text"
                                            className={styles.phoneValue}
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                        />
                                    </div>
                                    {isDirty && (
                                        <button className={styles.saveBtn} onClick={handleSave}>
                                            Save
                                        </button>
                                    )}
                                </div>
                                <div className={styles.seperator}></div>
                                <div className={styles.unitContainer}>
                                    <div className={styles.unitsMobile}>
                                        <div className={styles.unit}>
                                            <div className={styles.closeBtn}>
                                                <img src="/icons/closeBtn.png" alt="Close icon" className={styles.lightIcon} />
                                                <img src="/icons/closeBtn-second.png" alt="Close icon" className={styles.darkIcon} />
                                            </div>
                                            <div className={styles.unitName}>
                                                <p>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</p>
                                            </div>
                                            <div className={styles.unitImage}>
                                                <img src="../../images/products/824186.png" alt="Chiller image" />
                                            </div>
                                            <div className={styles.unitDocument}>
                                                <div className={styles.documentIcon}>
                                                    <img src="/icons/projectDocument.png" alt="Project document icon" className={styles.lightIcon} />
                                                    <img src="/icons/projectDocument-darkMode.png" alt="Project document icon" className={styles.darkIcon} />
                                                </div>
                                                <p>Project_Document</p>
                                            </div>
                                        </div>
                                        <div className={styles.unit}>
                                            <div className={styles.closeBtn}>
                                                <img src="/icons/closeBtn.png" alt="Close icon" className={styles.lightIcon} />
                                                <img src="/icons/closeBtn-second.png" alt="Close icon" className={styles.darkIcon} />
                                            </div>
                                            <div className={styles.unitName}>
                                                <p>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</p>
                                            </div>
                                            <div className={styles.unitImage}>
                                                <img src="../../images/products/824186.png" alt="Chiller image" />
                                            </div>
                                            <div className={styles.unitDocument}>
                                                <div className={styles.documentIcon}>
                                                    <img src="/icons/projectDocument.png" alt="Project document icon" className={styles.lightIcon} />
                                                    <img src="/icons/projectDocument-darkMode.png" alt="Project document icon" className={styles.darkIcon} />
                                                </div>
                                                <p>Project_Document</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.unitsDesktop}>
                                        <div className={styles.unit}>
                                            <div className={styles.closeBtn}>
                                                <img src="/icons/closeBtn.png" alt="Close icon" className={styles.lightIcon} />
                                                <img src="/icons/closeBtn-second.png" alt="Close icon" className={styles.darkIcon} />
                                            </div>
                                            <div className={styles.unitDetails}>
                                                <div className={styles.unitInfo}>
                                                    <div className={styles.unitName}>
                                                        <p>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</p>
                                                    </div>
                                                    <div className={styles.unitDocument}>
                                                        <div className={styles.documentIcon}>
                                                            <img src="/icons/projectDocument.png" alt="Project document icon" className={styles.lightIcon} />
                                                            <img src="/icons/projectDocument-darkMode.png" alt="Project document icon" className={styles.darkIcon} />
                                                        </div>
                                                        <p>Project_Document</p>
                                                    </div>
                                                </div>
                                                <div className={styles.unitImage}>
                                                    <img src="../../images/products/824186.png" alt="Chiller image" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.unit}>
                                            <div className={styles.closeBtn}>
                                                <img src="/icons/closeBtn.png" alt="Close icon" className={styles.lightIcon} />
                                                <img src="/icons/closeBtn-second.png" alt="Close icon" className={styles.darkIcon} />
                                            </div>
                                            <div className={styles.unitDetails}>
                                                <div className={styles.unitInfo}>
                                                    <div className={styles.unitName}>
                                                        <p>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</p>
                                                    </div>
                                                    <div className={styles.unitDocument}>
                                                        <div className={styles.documentIcon}>
                                                            <img src="/icons/projectDocument.png" alt="Project document icon" className={styles.lightIcon} />
                                                            <img src="/icons/projectDocument-darkMode.png" alt="Project document icon" className={styles.darkIcon} />
                                                        </div>
                                                        <p>Project_Document</p>
                                                    </div>
                                                </div>
                                                <div className={styles.unitImage}>
                                                    <img src="../../images/products/824186.png" alt="Chiller image" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.unit}>
                                            <div className={styles.closeBtn}>
                                                <img src="/icons/closeBtn.png" alt="Close icon" className={styles.lightIcon} />
                                                <img src="/icons/closeBtn-second.png" alt="Close icon" className={styles.darkIcon} />
                                            </div>
                                            <div className={styles.unitDetails}>
                                                <div className={styles.unitInfo}>
                                                    <div className={styles.unitName}>
                                                        <p>OffiTec Modular High-Capacity Air-Cooled Industrial Chiller Unit</p>
                                                    </div>
                                                    <div className={styles.unitDocument}>
                                                        <div className={styles.documentIcon}>
                                                            <img src="/icons/projectDocument.png" alt="Project document icon" className={styles.lightIcon} />
                                                            <img src="/icons/projectDocument-darkMode.png" alt="Project document icon" className={styles.darkIcon} />
                                                        </div>
                                                        <p>Project_Document</p>
                                                    </div>
                                                </div>
                                                <div className={styles.unitImage}>
                                                    <img src="../../images/products/824186.png" alt="Chiller image" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`${styles.project} ${styles.projectClose}`} onClick={() => setIsOpen(true)}>
                        <div className={styles.projectName}>
                            <h2 className={styles.desktopName}>{projectName}</h2>
                            <h2 className={styles.mobileName}>{formatMobileProjectName(projectName)}</h2>
                        </div>
                        <div className={styles.dates}>
                            <div className={styles.date}>
                                <span className={styles.dateTitle}>Creation Date:</span>
                                <span className={styles.dateValue}>01/01/2024</span>
                            </div>
                            <div className={styles.date}>
                                <span className={styles.dateTitle}>Update Date:</span>
                                <span className={styles.dateValue}>01/01/2024</span>
                            </div>
                        </div>
                        <div className={styles.arrow}>
                            <img src="/icons/back.png" alt="Arrow down icon" className={styles.lightIcon} />
                            <img src="/icons/back-darkMode.png" alt="Arrow down icon" className={styles.darkIcon} />
                        </div>
                    </div>
                )}
            </div>

            {isCreateModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalCloseBtn} onClick={() => setIsCreateModalOpen(false)}>
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="Close" />
                        </div>
                        <div className={styles.createModalContent}>
                            <h2>Create Project</h2>
                            <div className={styles.projectForm}>
                                <div className={styles.formRow}>
                                    <label>Project Name</label>
                                    <input type="text" />
                                </div>
                                <div className={styles.formRow}>
                                    <label>Address</label>
                                    <textarea />
                                </div>
                                <div className={styles.formRow}>
                                    <label>Country</label>
                                    <input type="text" />
                                </div>
                                <div className={styles.formRow}>
                                    <label>City</label>
                                    <input type="text" />
                                </div>
                                <div className={styles.formRow}>
                                    <label>Phone</label>
                                    <input type="text" />
                                </div>
                                <div className={styles.formActions}>
                                    <button className={styles.btnSecondary} onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                    <button className={styles.btnPrimary} onClick={() => setIsCreateModalOpen(false)}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
