// Organizations page for organization activities.
import React from "react";
import OrgHeader from "@/components/OrgHeader/OrgHeader";
import Events from "@/components/Events/Events";

const OrganizationActivityPage = () => {
    return (
        <div className="p-2">
            <OrgHeader />
            <Events />
        </div>
    );
};

export default OrganizationActivityPage;
