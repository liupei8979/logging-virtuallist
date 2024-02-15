<script lang="ts">
	browser &&
		console.log(
			`%c   
-------------------------------------------------------------------------------------
|                                                                                   |
__  __ _       _                         __  __                                   	|
 |  \/  (_)_ __ | |_ ___  ___ __ _ _ __   |  \/  | __ _ _ __   __ _  __ _  ___ _ __ |
 | |\/| | | '_ \| __/ __|/ __/ _\` | '_ \  | |\/| |/ _\` | '_ \ / _\` |/ _\` |/ _ \ |
 | |  | | | | | | |_\__ \ (_| (_| | | | | | |  | | (_| | | | | (_| | (_| |  __/ |   |
 |_|  |_|_|_| |_|\__|___/\___\__,_|_| |_| |_|  |_|\__,_|_| |_|\__,_|\__, |\___|_|   |
                                                                    |___/       	|	     
|                                                                                   |     
|                                                                                   |
-------------------------------------------------------------------------------------
                     Hello Everyone, How are you feeling today?                           

`,
			'background: #00000000; color: #0dd0ec'
		);
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
    import { socketStore } from '@src/store/socket';
	import {
		Column,
		Content,
		Header,
		HeaderNav,
		HeaderNavItem,
		Row,
		SideNav,
		SideNavItems,
		SideNavMenu,
		SideNavMenuItem,
		SkipToContent
	} from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/g100.css';
    import { onDestroy } from 'svelte';

    if (browser) {
		socketStore.connect();
		onDestroy(() => {
			socketStore?.disconnect();
		});
	}
	let isSideNavOpen = false;
</script>

<Header
	persistentHamburgerMenu={true}
	company="Log"
	platformName="Virtualization"
	bind:isSideNavOpen
>
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
</Header>

<Content class="custom-content">
	<Row>
		<Column>
			<slot />
		</Column>
	</Row>
</Content>
```

<style lang="scss">
	:global(.custom-content) {
		padding-left: 0;
		padding-right: 0;
	}
</style>
