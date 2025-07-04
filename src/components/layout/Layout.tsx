import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  sidebarItems: Array<{
    path: string;
    label: string;
    icon: React.ReactNode;
  }>;
  sidebarTitle: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  sidebarItems,
  sidebarTitle
}) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar items={sidebarItems} title={sidebarTitle} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};