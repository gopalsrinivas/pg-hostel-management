import { v4 as uuid } from 'uuid';
/**
 *  All Dashboard Routes
 *
 *  Understanding name/value pairs for Dashboard routes
 *
 *  Applicable for main/root/level 1 routes
 *  icon 		: String - It's only for main menu or you can consider 1st level menu item to specify icon name.
 *
 *  Applicable for main/root/level 1 and subitems routes
 * 	id 			: Number - You can use uuid() as value to generate unique ID using uuid library, you can also assign constant unique ID for react dynamic objects.
 *  title 		: String - If menu contains childern use title to provide main menu name.
 *  badge 		: String - (Optional - Default - '') If you specify badge value it will be displayed beside the menu title or menu item.
 * 	badgecolor 	: String - (Optional - Default - 'primary' ) - Used to specify badge background color.
 *
 *  Applicable for subitems / children items routes
 *  name 		: String - If it's menu item in which you are specifiying link, use name ( don't use title for that )
 *  children	: Array - Use to specify submenu items
 *
 *  Used to segrigate menu groups
 *  grouptitle : Boolean - (Optional - Default - false ) If you want to group menu items you can use grouptitle = true,
 *  ( Use title : value to specify group title  e.g. COMPONENTS , DOCUMENTATION that we did here. )
 *
 */

export const DashboardMenu = [
	{
		id: uuid(),
		title: 'Dashboard',
		icon: 'home',
		link: '/dashboard/main-dashboard'
	},
	{
		id: uuid(),
		title: 'LAYOUTS',
		grouptitle: true
	},
	{
		id: uuid(),
		title: 'Hostel Detail',
		icon: 'layers',
		children: [
			{ id: uuid(), link: '/hostels/hostellist', name: 'Hostel List' },
			{ id: uuid(), link: '/hostels/hostelfloors', name: 'Hostel Floors' },
			{ id: uuid(), link: '/hostels/hostelrooms', name: 'Hostel Rooms' },
		]
	},
	{
		id: uuid(),
		title: 'Bed Detail',
		icon: 'layers',
		children: [
			{ id: uuid(), link: '/beds/bedallocation', name: 'Bed Allocation' },
			{ id: uuid(), link: '/beds/bedvacation', name: 'Bed Vacation' },
			{ id: uuid(), link: '/beds/bedpayment', name: 'Bed Payment' },
		]
	},
	{
		id: uuid(),
		title: 'UI COMPONENTS',
		grouptitle: true
	},
	{
		id: uuid(),
		title: 'Settings',
		icon: 'monitor',
		children: [
			{ id: uuid(), link: '/me/profile', name: 'Edit Profile' },
			{ id: uuid(), link: '/me/changepassword', name: 'Change Password' },
			{ id: uuid(), link: '/', name: 'Logout' },
		]
	},
];

export default DashboardMenu;
