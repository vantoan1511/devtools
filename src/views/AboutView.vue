<template>
    <div class="absolute justify-center">
        <ProfileCard name="Toan Nguyen" title="Software Engineer" handle="vantoan1511" status="Do not disturb"
            contact-text="Contact Me"
            avatar-url="https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-1/584403211_4267207293605525_766532575112376267_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=ymUJPHSqK-sQ7kNvwE7A7LH&_nc_oc=AdozK96eKhvzy2XllM0x19K6qTrw8AFJZep9hs2mjKcAAzAA1DFkch8hJA9SSAGXSow&_nc_pt=1&_nc_zt=24&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=wTHlyIhpD_ZBpYzxgrJqBQ&_nc_ss=7a3a8&oh=00_Af2YTtz8hohOI7toZeDNTBGRHefP6FzUs88AF_hNGoLVzA&oe=69DFCF3D"
            icon-url="https://scontent.fsgn2-9.fna.fbcdn.net/v/t39.30808-1/584403211_4267207293605525_766532575112376267_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=106&ccb=1-7&_nc_sid=e99d92&_nc_ohc=ymUJPHSqK-sQ7kNvwE7A7LH&_nc_oc=AdozK96eKhvzy2XllM0x19K6qTrw8AFJZep9hs2mjKcAAzAA1DFkch8hJA9SSAGXSow&_nc_pt=1&_nc_zt=24&_nc_ht=scontent.fsgn2-9.fna&_nc_gid=wTHlyIhpD_ZBpYzxgrJqBQ&_nc_ss=7a3a8&oh=00_Af2YTtz8hohOI7toZeDNTBGRHefP6FzUs88AF_hNGoLVzA&oe=69DFCF3D"
            grain-url="/logo.svg" :show-user-info="true" :show-behind-gradient="true" :enable-tilt="true"
            @contact-click="handleContactClick" />
    </div>
</template>

<script setup lang="ts">
const handleContactClick = () => {
};
</script>