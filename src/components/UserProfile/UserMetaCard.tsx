import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { useProfileData } from "../../hooks/useProfileData";
import { useState, useEffect } from "react";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, updateUser } = useAuth();
  console.log(user);
  const { profileData, updateFields } = useProfileData();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    facebook: '',
    xcom: '',
    linkedin: '',
    instagram: ''
  });

  // Initialize form data with user data and profile data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        facebook: profileData.facebook || '',
        xcom: profileData.xcom || '',
        linkedin: profileData.linkedin || '',
        instagram: profileData.instagram || ''
      });
    }
  }, [user, profileData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (user) {
      // Update user data with new information
      const updatedUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName
      };

      updateUser(updatedUserData);

      // Update profile data
      updateFields({
        bio: formData.bio,
        location: formData.location,
        facebook: formData.facebook,
        xcom: formData.xcom,
        linkedin: formData.linkedin,
        instagram: formData.instagram
      });

      console.log("Saving changes...", formData);
      closeModal();
    }
  };

  // Helper function to display data or "-" if empty
  const displayData = (value: string | undefined) => {
    return value && value.trim() !== '' ? value : '-';
  };

  if (!user) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img src="/images/user/owner.jpg" alt="user" />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {displayData(user.firstName)} {displayData(user.lastName)}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Role: {displayData(user.role)}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      placeholder="https://www.facebook.com/yourprofile"
                    />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input
                      type="text"
                      value={formData.xcom}
                      onChange={(e) => handleInputChange('xcom', e.target.value)}
                      placeholder="https://x.com/yourprofile"
                    />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Bio</Label>
                    <Input
                      type="text"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Location</Label>
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
