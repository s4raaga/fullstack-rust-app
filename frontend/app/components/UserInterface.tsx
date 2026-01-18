"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import CardComponent from "./CardComponent";

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserInterfaceProps {
  backendName: string;
}

const UserInterface: React.FC<UserInterfaceProps> = ({ backendName }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "" });
  const [updateUser, setUpdateUser] = useState({ id: "", name: "", email: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/${backendName}/users`);
        setUsers(response.data.reverse());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [backendName, apiUrl]);

  const createUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/api/${backendName}/users`, newUser);
      setUsers([response.data, ...users]);
      setNewUser({ name: "", email: "" });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/api/${backendName}/users/${updateUser.id}`, {
        name: updateUser.name,
        email: updateUser.email,
      });
      setUsers(
        users.map((user) => {
          if (user.id === parseInt(updateUser.id)) {
            return { ...user, name: updateUser.name, email: updateUser.email };
          }
          return user;
        })
      );
      setUpdateUser({ id: "", name: "", email: "" });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await axios.delete(`${apiUrl}/api/${backendName}/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
        <div className="flex items-center gap-4">
          <img
            src={`/${backendName}logo.svg`}
            alt={`${backendName} Logo`}
            className="w-14 h-14 bg-white/10 rounded-xl p-2"
          />
          <div>
            <h2 className="text-2xl font-bold text-white">
              {backendName.charAt(0).toUpperCase() + backendName.slice(1)} Backend
            </h2>
            <p className="text-orange-100 text-sm">Manage your users</p>
          </div>
        </div>
      </div>

      {/* Forms */}
      <div className="p-6 space-y-6">
        {/* Add User Form */}
        <form onSubmit={createUser} className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Add New User
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="col-span-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="col-span-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/25 active:scale-[0.98]"
          >
            Add User
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-gray-700"></div>

        {/* Update User Form */}
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Update User
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="ID"
              value={updateUser.id}
              onChange={(e) => setUpdateUser({ ...updateUser, id: e.target.value })}
              className="col-span-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <input
              placeholder="New Name"
              value={updateUser.name}
              onChange={(e) => setUpdateUser({ ...updateUser, name: e.target.value })}
              className="col-span-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <input
              placeholder="New Email"
              value={updateUser.email}
              onChange={(e) => setUpdateUser({ ...updateUser, email: e.target.value })}
              className="col-span-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
          >
            Update User
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-gray-900/50 p-6 border-t border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Users
            </h3>
          </div>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
            {users.length} total
          </span>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-4xl mb-2">👤</div>
              <p className="text-gray-400">No users yet</p>
              <p className="text-gray-500 text-sm">Add one above to get started</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all group"
              >
                <CardComponent card={user} />
                <button
                  onClick={() => deleteUser(user.id)}
                  className="opacity-60 group-hover:opacity-100 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-sm font-medium py-2 px-4 rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInterface;
