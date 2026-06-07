"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./adminPanel.module.css";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role !== 'ADMIN') {
            router.push('/chiller');
        }
    }, [router]);

    // Determine the active top-level option based on pathname
    let activeOption = "Home";
    if (pathname.includes("/add-unit")) {
        activeOption = "Add Unit";
    } else if (pathname.includes("/edit-unit")) {
        activeOption = "Edit Unit";
    } else if (pathname.includes("/add-component")) {
        activeOption = "Add Component";
    } else if (pathname.includes("/edit-component")) {
        activeOption = "Edit Component";
    } else if (pathname.includes("/analysis")) {
        activeOption = "Analytics";
    } else if (pathname.includes("/projects")) {
        activeOption = "Projects";
    }

    useEffect(() => {
        if (window.innerWidth >= 1200) {
            const element = document.getElementById(`option-${activeOption}`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            }
        }
    }, [activeOption]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleToggle = () => setIsSidebarOpen(prev => !prev);
        window.addEventListener('toggleMobileSidebar', handleToggle as EventListener);
        return () => window.removeEventListener('toggleMobileSidebar', handleToggle as EventListener);
    }, []);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.classList.add('mobile-sidebar-open');
        } else {
            document.body.classList.remove('mobile-sidebar-open');
        }
        return () => {
            document.body.classList.remove('mobile-sidebar-open');
        };
    }, [isSidebarOpen]);

    const handleOptionClick = (path: string, isParentWithChildren: boolean = false) => {
        if (!isParentWithChildren) {
            if (window.innerWidth < 1200 && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        }
        router.push(path);
    };

    return <>
        <div className={styles.container}>
            <div className={styles.sidebarPlaceholder}></div>
            <div className={`${styles.containerFirst} ${!isSidebarOpen ? styles.containerFirstClosed : ""}`}>
                <div className={styles.topIcon}>
                    <img
                        src="/icons/back.png"
                        alt="Toggle Sidebar"
                        className={`${isSidebarOpen ? styles.backIcon : styles.backIconReversed} ${styles.lightIcon}`}
                        onClick={toggleSidebar}
                    />
                    <img
                        src="/icons/back-darkMode.png"
                        alt="Toggle Sidebar"
                        className={`${isSidebarOpen ? styles.backIcon : styles.backIconReversed} ${styles.darkIcon}`}
                        onClick={toggleSidebar}
                    />
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.profilePic}>
                        <img src="/icons/profilePic.png" alt="Profile Picture" />
                    </div>
                    <div className={styles.userName}>
                        <h2>Admin User</h2>
                    </div>
                    <div className={styles.infoLine}></div>
                </div>

                <div className={styles.menuOptions}>
                    {/* HOME */}
                    <div
                        className={`${styles.option} ${activeOption === "Home" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("/admin-panel")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Home" ? (
                                <img src="/icons/home-filled.png" alt="Home" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="/icons/home-lightMode.png" alt="Home" />
                                    <img className={styles.darkIcon} src="/icons/home-darkMode.png" alt="Home" />
                                </>
                            )}
                        </div>
                        <p>Home</p>
                    </div>

                    <div className={styles.divider}></div>

                    {/* ADD UNIT */}
                    <div className={styles.optionArea} id="option-Add Unit">
                        <div
                            className={`${styles.option} ${activeOption === "Add Unit" ? styles.optionActive : ""}`}
                            onClick={() => handleOptionClick("/admin-panel/add-unit/chiller", true)}
                        >
                            <div className={styles.optionIcon}>
                                {activeOption === "Add Unit" ? (
                                    <img src="/icons/add-filled.png" alt="Add Unit" />
                                ) : (
                                    <>
                                        <img className={styles.lightIcon} src="/icons/add-lightMode.png" alt="Add Unit" />
                                        <img className={styles.darkIcon} src="/icons/add-darkMode.png" alt="Add Unit" />
                                    </>
                                )}
                            </div>
                            <p style={{ flex: 1 }}>Add Unit</p>
                            <div className={styles.arrow}>
                                <img src="/icons/back.png" alt="" className={styles.lightIcon} />
                                <img src="/icons/back-darkMode.png" alt="" className={styles.darkIcon} />
                            </div>
                        </div>
                        {activeOption === "Add Unit" && (
                            <div className={styles.subOptionsArea}>
                                <div className={styles.optionsLine}></div>
                                <div className={styles.options}>
                                    <div 
                                        className={`${styles.subOption} ${pathname.includes('/add-unit/chiller') ? styles.subOptionActive : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/add-unit/chiller'); }}
                                    >
                                        <p>Chiller</p>
                                    </div>
                                    <div 
                                        className={`${styles.subOption} ${pathname.includes('/add-unit/heat-pump') ? styles.subOptionActive : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/add-unit/heat-pump-model'); }}
                                    >
                                        <p>Heat Pump</p>
                                    </div>
                                    <div 
                                        className={`${styles.subOption} ${pathname === '/admin-panel/add-unit/heat-pump-model' ? styles.subOptionActive : ''}`}
                                        style={{ paddingLeft: '40px' }}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/add-unit/heat-pump-model'); }}
                                    >
                                        <p>Model</p>
                                    </div>
                                    <div 
                                        className={`${styles.subOption} ${pathname === '/admin-panel/add-unit/heat-pump-mod' ? styles.subOptionActive : ''}`}
                                        style={{ paddingLeft: '40px' }}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/add-unit/heat-pump-mod'); }}
                                    >
                                        <p>Mod</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* EDIT UNIT */}
                    <div className={styles.optionArea} id="option-Edit Unit">
                        <div
                            className={`${styles.option} ${activeOption === "Edit Unit" ? styles.optionActive : ""}`}
                            onClick={() => handleOptionClick("/admin-panel/edit-unit/chiller", true)}
                        >
                            <div className={styles.optionIcon}>
                                {activeOption === "Edit Unit" ? (
                                    <img src="/icons/ap-edit-filled.png" alt="Edit Unit" />
                                ) : (
                                    <>
                                        <img className={styles.lightIcon} src="/icons/ap-edit-lightMode.png" alt="Edit Unit" />
                                        <img className={styles.darkIcon} src="/icons/ap-edit-darkMode.png" alt="Edit Unit" />
                                    </>
                                )}
                            </div>
                            <p style={{ flex: 1 }}>Edit Unit</p>
                            <div className={styles.arrow}>
                                <img src="/icons/back.png" alt="" className={styles.lightIcon} />
                                <img src="/icons/back-darkMode.png" alt="" className={styles.darkIcon} />
                            </div>
                        </div>
                        {activeOption === "Edit Unit" && (
                            <div className={styles.subOptionsArea}>
                                <div className={styles.optionsLine}></div>
                                <div className={styles.options}>
                                    <div 
                                        className={`${styles.subOption} ${pathname.includes('/edit-unit/chiller') ? styles.subOptionActive : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/edit-unit/chiller'); }}
                                    >
                                        <p>Chiller</p>
                                    </div>
                                    <div 
                                        className={`${styles.subOption} ${pathname.includes('/edit-unit/heat-pump') ? styles.subOptionActive : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/edit-unit/heat-pump-model'); }}
                                    >
                                        <p>Heat Pump</p>
                                    </div>
                                    <div 
                                        className={`${styles.subOption} ${pathname === '/admin-panel/edit-unit/heat-pump-model' ? styles.subOptionActive : ''}`}
                                        style={{ paddingLeft: '40px' }}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/edit-unit/heat-pump-model'); }}
                                    >
                                        <p>Model</p>
                                    </div>
                                    <div 
                                        className={`${styles.subOption} ${pathname === '/admin-panel/edit-unit/heat-pump-mod' ? styles.subOptionActive : ''}`}
                                        style={{ paddingLeft: '40px' }}
                                        onClick={(e) => { e.stopPropagation(); handleOptionClick('/admin-panel/edit-unit/heat-pump-mod'); }}
                                    >
                                        <p>Mod</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.divider}></div>

                    {/* ADD COMPONENT */}
                    <div className={styles.optionArea} id="option-Add Component">
                        <div
                            className={`${styles.option} ${activeOption === "Add Component" ? styles.optionActive : ""}`}
                            onClick={() => handleOptionClick("/admin-panel/add-component/compressor", true)}
                        >
                            <div className={styles.optionIcon}>
                                {activeOption === "Add Component" ? (
                                    <img src="/icons/component-filled.png" alt="Add Component" />
                                ) : (
                                    <>
                                        <img className={styles.lightIcon} src="/icons/component-lightMode.png" alt="Add Component" />
                                        <img className={styles.darkIcon} src="/icons/component-darkMode.png" alt="Add Component" />
                                    </>
                                )}
                            </div>
                            <p style={{ flex: 1 }}>Add Component</p>
                            <div className={styles.arrow}>
                                <img src="/icons/back.png" alt="" className={styles.lightIcon} />
                                <img src="/icons/back-darkMode.png" alt="" className={styles.darkIcon} />
                            </div>
                        </div>
                        {activeOption === "Add Component" && (
                            <div className={styles.subOptionsArea}>
                                <div className={styles.optionsLine}></div>
                                <div className={styles.options}>
                                    {["compressor", "evaporator", "condenser", "expansion-valve", "4-way-reversing-valve", "chassis", "refrigerant"].map(item => (
                                        <div 
                                            key={item}
                                            className={`${styles.subOption} ${pathname.includes(`/add-component/${item}`) ? styles.subOptionActive : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleOptionClick(`/admin-panel/add-component/${item}`); }}
                                        >
                                            <p>{item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* EDIT COMPONENT */}
                    <div className={styles.optionArea} id="option-Edit Component">
                        <div
                            className={`${styles.option} ${activeOption === "Edit Component" ? styles.optionActive : ""}`}
                            onClick={() => handleOptionClick("/admin-panel/edit-component/compressor", true)}
                        >
                            <div className={styles.optionIcon}>
                                {activeOption === "Edit Component" ? (
                                    <img src="/icons/editComponent-filled.png" alt="Edit Component" />
                                ) : (
                                    <>
                                        <img className={styles.lightIcon} src="/icons/editComponent-lightMode.png" alt="Edit Component" />
                                        <img className={styles.darkIcon} src="/icons/editComponent-darkMode.png" alt="Edit Component" />
                                    </>
                                )}
                            </div>
                            <p style={{ flex: 1 }}>Edit Component</p>
                            <div className={styles.arrow}>
                                <img src="/icons/back.png" alt="" className={styles.lightIcon} />
                                <img src="/icons/back-darkMode.png" alt="" className={styles.darkIcon} />
                            </div>
                        </div>
                        {activeOption === "Edit Component" && (
                            <div className={styles.subOptionsArea}>
                                <div className={styles.optionsLine}></div>
                                <div className={styles.options}>
                                    {["compressor", "evaporator", "condenser", "expansion-valve", "4-way-reversing-valve", "chassis", "refrigerant"].map(item => (
                                        <div 
                                            key={item}
                                            className={`${styles.subOption} ${pathname.includes(`/edit-component/${item}`) ? styles.subOptionActive : ''}`}
                                            onClick={(e) => { e.stopPropagation(); handleOptionClick(`/admin-panel/edit-component/${item}`); }}
                                        >
                                            <p>{item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.divider}></div>

                    {/* ANALYTICS */}
                    <div
                        className={`${styles.option} ${activeOption === "Analytics" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("/admin-panel/analysis")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Analytics" ? (
                                <img src="/icons/chart-filled.png" alt="Analytics" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="/icons/chart-light.png" alt="Analytics" />
                                    <img className={styles.darkIcon} src="/icons/chart-dark.png" alt="Analytics" />
                                </>
                            )}
                        </div>
                        <p>Analytics</p>
                    </div>

                    {/* PROJECTS */}
                    <div
                        className={`${styles.option} ${activeOption === "Projects" ? styles.optionActive : ""}`}
                        onClick={() => handleOptionClick("/admin-panel/projects")}
                    >
                        <div className={styles.optionIcon}>
                            {activeOption === "Projects" ? (
                                <img src="/icons/project-filled.png" alt="Projects" />
                            ) : (
                                <>
                                    <img className={styles.lightIcon} src="/icons/project-light.png" alt="Projects" />
                                    <img className={styles.darkIcon} src="/icons/project-dark.png" alt="Projects" />
                                </>
                            )}
                        </div>
                        <p>Projects</p>
                    </div>

                    <div className={`${styles.divider} ${styles.mobileLogout}`} style={{ margin: '20px 0' }}></div>
                    
                    <div
                        className={`${styles.option} ${styles.mobileLogout}`}
                        onClick={async () => {
                            try {
                                await fetch('http://localhost:8080/auth/logout', { method: 'POST', credentials: 'include' });
                            } catch (e) { console.error(e); }
                            localStorage.removeItem('userId');
                            localStorage.removeItem('userRole');
                            window.location.href = '/login';
                        }}
                    >
                        <p style={{ color: '#d9534f', fontWeight: 'bold' }}>Log out</p>
                    </div>
                </div>
            </div>
            
            <div className={styles.containerSecond}>
                {isSidebarOpen && (
                    <div className={styles.overlay} onClick={toggleSidebar}></div>
                )}
                {children}
            </div>
        </div>
    </>;
}
