using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace AFWidget
{
    public partial class AFWidgetTest : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                hf_test.Value = "a#2014-04-16#1000#1;b#2014-04-15#1000#2;";
                hf_test1.Value = "a#2014-04-16#1000#1;b#2014-04-15#1000#2;c#2014-04-26#2000#1;";
            }
        }
    }
}