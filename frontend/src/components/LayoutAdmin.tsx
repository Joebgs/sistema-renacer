import Layout from './Layout';
import { LAYOUT_CONFIGS } from '../constants/layout';

interface LayoutAdminProps {
  children: React.ReactNode;
  title: string;
}

function LayoutAdmin({ children, title }: LayoutAdminProps) {
  const config = LAYOUT_CONFIGS.ADMIN;
  return (
    <Layout
      title={title}
      menuItems={config.menuItems}
      sidebarBg={config.sidebarBg}
      sidebarBorder={config.sidebarBorder}
      sidebarHover={config.sidebarHover}
      userBg={config.userBg}
      panelTitle={config.panelTitle}
      showMobileMenu={config.showMobileMenu}
    >
      {children}
    </Layout>
  );
}

export default LayoutAdmin;